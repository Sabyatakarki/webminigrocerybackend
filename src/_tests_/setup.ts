import mongoose from 'mongoose';
import { connectDatabase } from '../database/db';
beforeAll(async () => {
    await connectDatabase();
});

afterAll(async () => {
    // Add any teardown logic if necessary
    await mongoose.connection.close();
});