/**
 * process-withdrawal — operator/admin endpoint to settle a withdrawal request.
 *
 *   action = 'reject'   → refund the held balance and mark the request rejected
 *                         (fully implemented; reverses request_withdrawal).
 *   action = 'complete' → execute the real payout, then mark completed.
 *
 * Service-role only (called by an admin tool or an internal job — NOT by end users).
 *
 * Real money movement (action='complete') requires Stripe Connect: a payout/transfer
 * to the user's connected account or bank. Bettr has no per-user payout destination
 * yet, so completion is gated behind PAYOUTS_ENABLED to prevent marking a request
 * "completed" without an actual disbursement. Wire the Stripe call where marked.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

// Constant-time compare so the service-role check has no timing side channel.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceKey);

  try {
    // Auth: service role only.
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    if (!serviceKey || !timingSafeEqual(token, serviceKey)) {
      return json({ error: 'Forbidden' }, 403);
    }

    const { request_id, action } = await req.json();
    if (!request_id || (action !== 'complete' && action !== 'reject')) {
      return json({ error: "request_id and action ('complete'|'reject') required" }, 400);
    }

    if (action === 'reject') {
      const { error } = await supabase.rpc('reject_withdrawal', { p_request_id: request_id });
      if (error) throw error;
      return json({ status: 'rejected', refunded: true });
    }

    // action === 'complete'
    const { data: wr } = await supabase
      .from('withdrawal_requests').select('id, user_id, amount, status').eq('id', request_id).single();
    if (!wr) return json({ error: 'Withdrawal not found' }, 404);
    if (wr.status !== 'pending' && wr.status !== 'processing') {
      return json({ status: wr.status, note: 'already terminal' });
    }

    const payoutsEnabled = (Deno.env.get('PAYOUTS_ENABLED') ?? 'false') === 'true';
    if (!payoutsEnabled) {
      // Do NOT mark completed without a real disbursement.
      return json({
        error: 'Payouts not configured. Set up Stripe Connect (per-user payout destination) ' +
               'and PAYOUTS_ENABLED=true before completing withdrawals.',
      }, 501);
    }

    // ── Execute the real payout here ─────────────────────────────────────────
    // const transfer = await stripe.transfers.create({ amount: Math.round(wr.amount * 100),
    //   currency: 'usd', destination: <user connected account> });
    // Only after a confirmed successful payout do we mark the request completed:
    const { error } = await supabase.rpc('complete_withdrawal', { p_request_id: request_id });
    if (error) throw error;
    return json({ status: 'completed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});
