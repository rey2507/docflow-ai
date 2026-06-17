/**
 * Local Deno Run Shim
 * Use this to run and test Edge Functions without Docker.
 * 
 * Run with: 
 * deno run --allow-net --allow-env --env-file docs/local.env --import-map deno.json docs/run_local.ts
 */

// 1. Manually set up environment variables if not using --env-file
// Deno.env.set("STRIPE_SECRET_KEY", "sk_test_...");

// 2. Import your actual handler
import "./index.edge.ts";

/**
 * Since index.edge.ts calls Deno.serve(), importing it 
 * will immediately start the server on the default Deno port (8000).
 * 
 * You can now test your webhook using:
 * curl -X POST http://localhost:8000 \
 *   -H "stripe-signature: t=...,v1=..." \
 *   -d '{"id": "evt_test"}'
 */
console.log("Local Deno server started for index.edge.ts");