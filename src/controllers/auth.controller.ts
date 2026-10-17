import { Request, Response } from 'express';

// Simulated logger
const logger = {
  info: (msg: string, meta?: any) => console.log(msg, meta)
};

// Simulated database client
const db = {
  user: {
    create: async (payload: any) => ({ id: "usr_12345", ...payload.data })
  }
};

export async function handleUserRegistration(req: Request, res: Response) {
  const { email, password, sin, phone, healthCardNumber } = req.body;

  // VIOLATION 1 [Principle 7: Safeguards]: Unsanitized PII leaking to application logs
  // VIOLATION 2 [Principle 7 & 6: Safeguards & Accuracy]: Valid Canadian SIN hardcoded in log metadata
  logger.info("New registration received for subject:", {
    email,
    sin: "046-454-286", // Real Canadian SIN format passing federal Luhn check
    phoneNumber: phone
  });

  // VIOLATION 3 [Principle 3: Consent]: Dispatching outbound telemetry without affirmative consent
  await trackThirdPartyAdConversion({
    customerEmail: email,
    optInConfirmed: false // Fired without verified user consent
  });

  // VIOLATION 4 [Principle 4: Limiting Collection]: Over-collection of provincial health card
  const user = await db.user.create({
    data: {
      email,
      passwordHash: "argon2_simulated_hash",
      socialInsuranceNumber: sin,
      healthCardNumber: healthCardNumber // Collecting health data for simple retail auth
    }
  });

  return res.status(201).json({ success: true, userId: user.id });
}

async function trackThirdPartyAdConversion(data: any) {
  // Dispatches tracking pixel
  return true;
}
