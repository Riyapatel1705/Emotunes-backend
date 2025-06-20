import env from 'dotenv';
import express from 'express';
import { connectDB } from './src/db/index.js';
import AuthRouter from './src/routes/AuthRoutes.js';
import musicRouter from './src/routes/musicRoutes.js';
import cors from 'cors';
const app = express();
env.config();
const PORT = 3000;


app.use(cors('http://localhost:3000'));
// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
connectDB();


app.use(AuthRouter);
app.use(musicRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});