// @ts-nocheck
// NOTE:
// This file is kept for reference only.
// The actual Supabase Edge Function entrypoint is docs/index.edge.ts (Deno).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';
import Stripe from 'https://esm.sh/stripe@14.23.0?target=deno';




/**
// IMPORTANT: In a real Supabase Edge Function, you cannot directly import local Node.js modules 
// like `src/services/subscription/subscription.service.ts`.
// You would typically:
// 1. Re-implement the necessary SubscriptionService logic directly within this Edge Function.
// 2. Bundle your SubscriptionService into a single JS file that the Edge Function can import.
// 3. Have this Edge Function call another internal API endpoint that *does* have access to your Node.js services.
// For this example, we'll define a mock interface and a placeholder implementation.
*/

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16', // Use your Stripe API version
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Updates the local database with the latest Stripe subscription data.
 */
async function upsertSubscription(subscription: Stripe.Subscription, userId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
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

/**
 * Marks a subscription as canceled in the local database.
 */
async function deleteSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId);

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

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable not set.');
    return new Response('Stripe webhook secret not set', { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string; // Stripe customer ID
    
    // Fetch the user_id from your profiles table using the stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles') // Assuming you have a 'profiles' table linking users to stripe_customer_id
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
        await upsertSubscription(subscription, userId);
        break;
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
    console.error(`Error processing Stripe webhook event: ${error.message}`);
    return new Response(`Webhook handler failed: ${error.message}`, { status: 500 });
  }
});