import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());

// SECURE: Restrict CORS origin to approved domains
app.use(cors({ origin: ['https://app.example.ca'] }));

// SECURE: Public privacy policy route declared
app.get('/privacy', (req: Request, res: Response) => {
  res.json({ policy: "https://example.ca/legal/privacy", version: "2026-v1" });
});

app.post('/auth/register', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default app;
