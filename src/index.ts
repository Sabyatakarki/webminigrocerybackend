import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import { connectDatabase } from './database/db';
import { PORT } from './config';
import { HttpError } from './errors/http-error';

// IMPORT API ROUTES
import authRoutes from './routes/auth.route';
import adminUserRoutes from './routes/admin/user.routes';

const app: Application = express();

/* CORS configuration (merged from both versions) */
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005'], // added extra origins from your code
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

/* Serve static public folder */
app.use(
  "/uploads/profile_pictures",
  express.static(path.join(__dirname, "../public/profile_pictures"))
);

/* Body parser middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* API ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes); // from your code

/* Root route */
app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the API',
  });
});

/* Global error handler */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

/* Start server */
async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();