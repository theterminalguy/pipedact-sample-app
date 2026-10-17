import { Request, Response } from "express";

function maskIdentifier(val: string): string {
  if (!val || val.length < 4) return "***";
  return val.slice(0, 2) + "***" + val.slice(-2);
}

export function handleUserAudit(req: Request, res: Response) {
  const { email, phone, userId } = req.body;

  // Compliant: Single-line sanitized logging
  console.info("User event logged for:", maskIdentifier(email));

  // Compliant: Single-line masked phone
  console.log("SMS notification dispatched to:", maskIdentifier(phone));

  // Compliant: Multiline sanitized logging
  console.info("Audit trail record created", {
    userId,
    email: maskIdentifier(email),
    phone: maskIdentifier(phone),
    timestamp: new Date().toISOString(),
  });

  // Compliant: Comment mentioning sensitive sink should be ignored
  // console.log("Debug raw password:", req.body.password);

  res.status(200).json({ status: "logged" });
}
