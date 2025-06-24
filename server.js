import express from 'express';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import env from 'dotenv';
import cors from 'cors';

import { connectDB } from './src/db/index.js';
import AuthRouter from './src/routes/AuthRoutes.js';
import musicRouter from './src/routes/musicRoutes.js';

env.config();
const app = express();
const PORT = 3000;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(cors({ origin: 'https://emo-tunes.vercel.app' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB();

app.use(AuthRouter);
app.use(musicRouter);

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
