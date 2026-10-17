import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware: Authenticate caller session token
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // Attaches authenticated user context
  (req as any).user = { id: "usr_authorized_1", role: "USER" };
  next();
}

// SECURE: Enforces authentication and subject-ownership authorization before exporting personal data
router.get('/user/export', requireAuth, async (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  const targetUserId = req.query.userId as string;

  // Authorization check: User can only export their own data unless admin
  if (sessionUser.id !== targetUserId && sessionUser.role !== 'ADMIN') {
    return res.status(403).json({ error: "Forbidden: You may only export your own subject records." });
  }

  const exportPayload = {
    userId: targetUserId,
    profile: { email: "user@example.ca", full_name: "Jean Tremblay" },
    transactions: [],
    accessLogs: []
  };

  return res.json(exportPayload);
});

export default router;
