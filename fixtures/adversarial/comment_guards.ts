// ADVERSARIAL CASE 1: Consent guard commented out with //
// The scanner must NOT allow commented guards to suppress real violations.
export async function sendMetricsVulnerable(email: string) {
  // if (hasConsentFor('marketing')) {
  await trackThirdPartyAdConversion({
    customerEmail: email,
    optInConfirmed: false
  });
  // }
}

// ADVERSARIAL CASE 2: Tracking call in comment
// The scanner must NOT emit false positive violations for commented code.
// await trackThirdPartyAdConversion({ customerEmail: "ignored@example.com" });

async function trackThirdPartyAdConversion(data: any) {
  return true;
}
