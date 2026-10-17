import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());

// VIOLATION [SOC 2 CC6.6]: Permissive wildcard CORS origin allows arbitrary cross-origin requests
app.use(cors({ origin: '*' }));

// Registration endpoint
app.post('/auth/register', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// User Archive / DSAR endpoint (also triggers PIPEDA-8-POLICY-ROUTE-MISSING because /user route exists without /privacy)
app.get('/user/export', (req: Request, res: Response) => {
  res.json({ records: [] });
});

export default app;
