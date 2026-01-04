// src/index.ts
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/db'; // your MongoDB connection
import { PORT } from './config'; // ensure PORT is exported from config.ts
import authRoutes from './routes/auth.route'; // your auth routes

import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

// Middleware
// ---------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------
// Routes
// ---------------------
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the API'
  });
});

// ---------------------
// Start Server
// ---------------------
async function startServer() {
  console.log("Starting server...");

  // Connect to MongoDB
  await connectDatabase();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Run server
startServer();
