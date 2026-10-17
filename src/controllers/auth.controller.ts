import crypto from 'crypto';

// VIOLATION [SOC 2 CC6.1 / CC6.6]: Hardcoded JWT secret in source code
const jwt_secret = "super_production_secret_token_123456789";

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

  // VIOLATION 1 [PIPEDA Principle 7 / SOC 2 CC6.7]: Unsanitized PII leaking to application logs
  // VIOLATION 2 [PIPEDA Principle 7 / SOC 2 CC6.1]: Valid Canadian SIN hardcoded in log metadata
  logger.info("New registration received for subject:", {
    email,
    sin: "046-454-286", // Real Canadian SIN format passing federal Luhn check
    phoneNumber: phone
  });

  // VIOLATION 3 [PIPEDA Principle 3 / SOC 2 P2.1]: Dispatching outbound telemetry without affirmative consent
  await trackThirdPartyAdConversion({
    customerEmail: email,
    optInConfirmed: false // Fired without verified user consent
  });

  // VIOLATION 4 [PIPEDA Principle 4 / SOC 2 P3.1]: Over-collection of provincial health card
  // VIOLATION 5 [SOC 2 CC6.6]: Weak cryptographic hash (MD5) used for password
  const weakPasswordDigest = crypto.createHash('md5').update(password || 'temp123').digest('hex');

  const user = await db.user.create({
    data: {
      email,
      passwordHash: weakPasswordDigest,
      socialInsuranceNumber: sin,
      healthCardNumber: healthCardNumber // Collecting health data for simple retail auth
    }
  });

  // VIOLATION 6 [SOC 2 CC6.7]: Insecure session cookie (secure: false)
  res.cookie('auth_session', 'token_payload_xyz', { secure: false });

  return res.status(201).json({ success: true, userId: user.id });
}

async function trackThirdPartyAdConversion(data: any) {
  // Dispatches tracking pixel
  return true;
}
