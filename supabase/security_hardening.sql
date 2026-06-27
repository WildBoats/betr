-- ============================================================================
-- security_hardening.sql  (applied to live project xzpvnkkghulalkpjusfs as
-- migrations: money_rpc_hardening, rls_lockdown_money_tables — 2026-06-27)
--
-- Closes the money/RLS holes found in the 2026-06 audit:
--   • clients can no longer write wallets / withdrawal_requests /
--     challenge_participants / transactions / points_ledger / challenges
--   • settle_challenge cannot double-pay (row lock)
--   • deposits are atomic + idempotent (no double-credit on Stripe retries)
--   • withdrawals are reversible (reject → refund) with a real payout pipeline
--   • all money writes flow through SECURITY DEFINER RPCs / service-role functions
-- This file mirrors what is live; keep it in sync with future changes.
-- ============================================================================

-- ── increment_wallet: never decrement via this path ────────────────────────
CREATE OR REPLACE FUNCTION public.increment_wallet(user_id uuid, amount numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
BEGIN
  IF amount IS NULL OR amount < 0 THEN
    RAISE EXCEPTION 'increment_wallet: amount must be non-negative (got %)', amount;
  END IF;
  UPDATE wallets w SET balance = w.balance + amount, updated_at = NOW()
  WHERE w.user_id = increment_wallet.user_id;
END;
$fn$;

-- ── request_withdrawal: positive-amount guard + row lock (no TOCTOU over-draw) ─
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_user_id uuid, p_amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_bal numeric; v_req_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid withdrawal amount.'; END IF;
  SELECT balance INTO v_bal FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_bal IS NULL OR v_bal < p_amount THEN RAISE EXCEPTION 'Insufficient balance.'; END IF;
  UPDATE wallets SET balance = balance - p_amount, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO withdrawal_requests (user_id, amount) VALUES (p_user_id, p_amount) RETURNING id INTO v_req_id;
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'withdrawal', p_amount, 'Withdrawal request — pending processing');
  RETURN v_req_id;
END;
$fn$;

-- ── settle_challenge: FOR UPDATE row lock (no double-settle) + lifecycle gate ──
--    (only a creator-triggered settle is gated; the service-role cron uses p_force).
--    Full canonical body lives in supabase/settlement.sql — keep them identical.
--    Key lines vs. the original:
--      SELECT ... , ends_at INTO ... FROM challenges WHERE id = p_challenge_id FOR UPDATE;
--      IF NOT p_force AND NOT (v_status='voting'
--           OR (v_status='live' AND v_ends_at IS NOT NULL AND v_ends_at <= NOW()))
--        THEN RAISE EXCEPTION 'Challenge has not ended yet — cannot settle.'; END IF;

-- ── Deposit idempotency ─────────────────────────────────────────────────────
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_session_id text;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_stripe_session_id_key ON transactions (stripe_session_id);

CREATE OR REPLACE FUNCTION public.credit_deposit(p_user_id uuid, p_amount numeric, p_session_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_rows int;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid deposit amount.'; END IF;
  IF p_session_id IS NULL OR length(p_session_id) = 0 THEN RAISE EXCEPTION 'Missing session id.'; END IF;
  INSERT INTO transactions (user_id, type, amount, description, stripe_session_id)
  VALUES (p_user_id, 'deposit', p_amount, 'Wallet deposit', p_session_id)
  ON CONFLICT (stripe_session_id) DO NOTHING;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows > 0 THEN PERFORM increment_wallet(p_user_id, p_amount); RETURN true; END IF;
  RETURN false;
END;
$fn$;

-- ── Withdrawal lifecycle (service-role) ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_withdrawal(p_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM withdrawal_requests WHERE id = p_request_id FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Withdrawal not found.'; END IF;
  IF v_status NOT IN ('pending','processing') THEN RETURN; END IF;
  UPDATE withdrawal_requests SET status = 'completed' WHERE id = p_request_id;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_status text; v_user uuid; v_amount numeric;
BEGIN
  SELECT status, user_id, amount INTO v_status, v_user, v_amount
    FROM withdrawal_requests WHERE id = p_request_id FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Withdrawal not found.'; END IF;
  IF v_status NOT IN ('pending','processing') THEN RETURN; END IF;
  UPDATE withdrawal_requests SET status = 'rejected' WHERE id = p_request_id;
  PERFORM increment_wallet(v_user, v_amount);
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (v_user, 'refund', v_amount, 'Withdrawal rejected — refunded');
END;
$fn$;

-- ── create_challenge: atomic create + optional stake-locking join ───────────
DROP FUNCTION IF EXISTS public.create_challenge(text,text,numeric,int,timestamptz,int,boolean);
CREATE OR REPLACE FUNCTION public.create_challenge(
  p_goal text, p_type text, p_bet_amount numeric, p_duration_days int,
  p_starts_at timestamptz, p_creator_fee_percent int, p_creator_participates boolean,
  p_cadence text DEFAULT 'daily', p_target_reps int DEFAULT NULL,
  p_required_count int DEFAULT NULL, p_allowed_misses int DEFAULT 0
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_uid uuid := auth.uid(); v_id uuid; v_ends timestamptz; v_fee int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated.'; END IF;
  IF coalesce(btrim(p_goal),'') = '' THEN RAISE EXCEPTION 'Goal is required.'; END IF;
  IF p_type NOT IN ('public','private') THEN RAISE EXCEPTION 'Invalid challenge type.'; END IF;
  IF p_bet_amount IS NULL OR p_bet_amount < 5 THEN RAISE EXCEPTION 'Minimum bet is $5.'; END IF;
  IF p_duration_days IS NULL OR p_duration_days < 1 THEN RAISE EXCEPTION 'Invalid duration.'; END IF;
  IF p_starts_at IS NULL OR p_starts_at < NOW() - interval '5 minutes' THEN
    RAISE EXCEPTION 'Start time must be in the future.'; END IF;
  IF coalesce(p_cadence,'daily') NOT IN ('daily','once') THEN RAISE EXCEPTION 'Invalid cadence.'; END IF;
  IF coalesce(p_allowed_misses,0) < 0 THEN RAISE EXCEPTION 'Invalid allowed_misses.'; END IF;
  IF p_target_reps IS NOT NULL AND p_target_reps <= 0 THEN RAISE EXCEPTION 'Invalid target_reps.'; END IF;
  IF p_required_count IS NOT NULL AND p_required_count <= 0 THEN RAISE EXCEPTION 'Invalid required_count.'; END IF;

  v_fee := CASE WHEN p_type = 'public' THEN LEAST(GREATEST(COALESCE(p_creator_fee_percent,0),0),10) ELSE 0 END;
  v_ends := p_starts_at + make_interval(days => p_duration_days);

  INSERT INTO challenges (creator_id, goal, type, bet_amount, duration_days, starts_at, ends_at,
                          creator_fee_percent, creator_participates, status, pot, participant_count,
                          cadence, target_reps, required_count, allowed_misses)
  VALUES (v_uid, btrim(p_goal), p_type, p_bet_amount, p_duration_days, p_starts_at, v_ends,
          v_fee, p_creator_participates, 'pending', 0, 0,
          coalesce(p_cadence,'daily'), p_target_reps, p_required_count, coalesce(p_allowed_misses,0))
  RETURNING id INTO v_id;

  IF p_creator_participates THEN PERFORM join_challenge(v_id); END IF;
  RETURN v_id;
END;
$fn$;

-- ── Function EXECUTE grants ─────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.credit_deposit(uuid,numeric,text)   FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.credit_deposit(uuid,numeric,text)   TO service_role;
REVOKE EXECUTE ON FUNCTION public.complete_withdrawal(uuid)           FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.complete_withdrawal(uuid)           TO service_role;
REVOKE EXECUTE ON FUNCTION public.reject_withdrawal(uuid)             FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.reject_withdrawal(uuid)             TO service_role;
REVOKE EXECUTE ON FUNCTION public.create_challenge(text,text,numeric,int,timestamptz,int,boolean,text,int,int,int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_challenge(text,text,numeric,int,timestamptz,int,boolean,text,int,int,int) TO authenticated, service_role;

-- ── RLS / GRANT lockdown — clients get SELECT only on money & stake tables ──
DROP POLICY IF EXISTS wallets_own ON wallets;
CREATE POLICY wallets_select ON wallets FOR SELECT USING ((select auth.uid()) = user_id);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON wallets FROM anon, authenticated;

DROP POLICY IF EXISTS withdrawals_own ON withdrawal_requests;
CREATE POLICY withdrawals_select ON withdrawal_requests FOR SELECT USING ((select auth.uid()) = user_id);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON withdrawal_requests FROM anon, authenticated;

DROP POLICY IF EXISTS participants_insert ON challenge_participants;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON challenge_participants FROM anon, authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON transactions  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON points_ledger FROM anon, authenticated;

DROP POLICY IF EXISTS challenges_insert ON challenges;
DROP POLICY IF EXISTS challenges_update ON challenges;
DROP POLICY IF EXISTS challenges_delete ON challenges;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON challenges FROM anon, authenticated;

-- ── profiles: clients may NOT write privileged columns ──────────────────────
--    is_reviewer would let a user join the neutral-reviewer pool and bias
--    settlement; stripe_customer_id / id are identity/payment linkage. Display
--    fields stay self-editable (still gated to the caller's own row by RLS).
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT  UPDATE (name, username, initials) ON public.profiles TO authenticated;

-- ── Defense in depth: drop dead client write grants on RLS-protected tables ──
--    (no write policy exists; writes flow only through SECURITY DEFINER RPCs /
--    service role). votes & friendships are intentionally left client-writable.
REVOKE INSERT, UPDATE, DELETE ON public.submissions           FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviews               FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.submission_flags      FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviewer_assignments  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.daily_tokens          FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.group_members         FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.accountability_groups FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.flagger_reputation    FROM anon, authenticated;
