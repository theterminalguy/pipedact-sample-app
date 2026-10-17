import express, { Request, Response } from 'express';

const router = express.Router();

// SCENARIO [UNSUPPORTED IN PIPEDACT STATIC RULES]: Missing authorization on sensitive export endpoint
// Vulnerability: An unauthenticated attacker can supply arbitrary userId to retrieve any user's personal archive (IDOR / BOLA)
// Note: Pipedact static analyzer does not currently evaluate authorization middleware boundaries or RBAC/ABAC context.
router.get('/user/export', async (req: Request, res: Response) => {
  const targetUserId = req.query.userId as string;
  // Directly returns sensitive personal records without verifying session ownership or authentication token
  const exportPayload = {
    userId: targetUserId,
    profile: { email: "victim@example.ca", full_name: "Jean Tremblay" },
    records: ["tax_slip_2025.pdf", "sin_verification.enc"]
  };
  return res.json(exportPayload);
});

export default router;
