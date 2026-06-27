import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    // Async variant is required in the Deno/edge runtime (uses SubtleCrypto).
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '');
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only credit fully-paid sessions. (Guards async payment methods that can fire
      // this event while still unpaid; card sessions are always 'paid' here.)
      if (session.payment_status !== 'paid') {
        return new Response(JSON.stringify({ received: true, skipped: 'unpaid' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userId = session.metadata?.user_id;
      // Trust the verified event's amount_total over client-influenced metadata.
      const amountCents = session.amount_total ?? Number(session.metadata?.amount_cents ?? 0);

      if (userId && amountCents > 0) {
        // Atomic + idempotent: credit_deposit inserts a transaction keyed on the unique
        // stripe_session_id (ON CONFLICT DO NOTHING) and only increments the wallet when
        // the insert actually created a row — so duplicate/concurrent deliveries are safe.
        const { error } = await supabase.rpc('credit_deposit', {
          p_user_id: userId,
          p_amount: amountCents / 100,
          p_session_id: session.id,
        });
        if (error) {
          // Surface the failure so Stripe retries. Idempotency makes the retry safe.
          console.error('credit_deposit failed:', error.message);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('webhook handler error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
