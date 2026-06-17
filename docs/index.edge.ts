// Supabase Edge Function (Deno) - Stripe webhook handler
// NOTE: This file is intended to be used by Deno/Supabase Edge Functions, not by the project's TypeScript build.
// If your tooling type-checks docs/**/*.ts, exclude docs/**/*.ts or rename to .edge.ts.

// URL imports are handled by `docs/types/esm-url-modules.d.ts`.
// Runtime still uses Deno/Edge Function URL modules.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';
import Stripe from 'https://esm.sh/stripe@14.23.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set');
}

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
if (!stripeWebhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable not set');
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable not set');
}

const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable not set');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function upsertSubscription(subscription: Stripe.Subscription, userId: string) {
  const { error } = await supabase.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0]?.price?.id,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

async function deleteSubscription(subscriptionId: string) {
  const { error } = await supabase.from('subscriptions').update({
    status: 'canceled',
    updated_at: new Date().toISOString(),
  }).eq('id', subscriptionId);

  if (error) throw error;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No Stripe signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err?.message ?? String(err)}`);
    return new Response(`Webhook Error: ${err?.message ?? String(err)}`, { status: 400 });
  }

  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profileError || !profile) {
      console.error(`User not found for Stripe customer ID: ${customerId}`, profileError);
      return new Response('User not found', { status: 404 });
    }

    const userId = profile.id;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await upsertSubscription(subscription, userId);
        break;
      case 'customer.subscription.deleted':
        await deleteSubscription(subscription.id);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error(`Error processing Stripe webhook event: ${error?.message ?? String(error)}`);
    return new Response(`Webhook handler failed: ${error?.message ?? String(error)}`, { status: 500 });
  }
});
