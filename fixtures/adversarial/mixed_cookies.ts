export function setAuthCookies(res: any, userToken: string, trackingId: string) {
  // SECURE COOKIE: Has both secure and httpOnly transmission safeguards
  res.cookie('session_token', userToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  });

  // INSECURE COOKIE: Even though another secure cookie exists in this same file,
  // this insecure cookie MUST be independently flagged.
  res.cookie('analytics_id', trackingId, {
    secure: false
  });
}
