import { Response } from "express";

export function handleSessionCookies(res: Response, sessionToken: string) {
  // Adversarial: Multiline cookie missing secure flag
  res.cookie(
    "session_id",
    sessionToken,
    {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
    }
  );

  // Compliant: Multiline cookie with both secure and httpOnly
  res.cookie(
    "csrf_token",
    "csrf-valid-token-value",
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    }
  );
}
