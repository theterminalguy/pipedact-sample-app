// ADVERSARIAL CASE: Secret embedded as fallback alongside environment variable
// Attackers/devs often write: process.env.API_KEY || "fallback_production_secret"
// The scanner must catch the hardcoded fallback secret!
export const paymentApiKey = process.env.STRIPE_API_KEY || "sk_live_99887766554433221100";
