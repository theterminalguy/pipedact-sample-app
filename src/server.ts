import express, { Request, Response } from 'express';
import cors from 'cors';
import { handleUserRegistration } from './controllers/auth.controller';
import { generateUserArchive } from './services/dsr.service';

const app = express();
app.use(express.json());

// VIOLATION [SOC 2 CC6.6]: Permissive wildcard CORS origin allows arbitrary cross-origin requests
app.use(cors({ origin: '*' }));

// Registration endpoint
app.post('/auth/register', handleUserRegistration);

// User Archive / DSAR endpoint
app.get('/user/export', async (req: Request, res: Response) => {
  const archive = await generateUserArchive(req.query.userId as string);
  res.json(archive);
});

export default app;
