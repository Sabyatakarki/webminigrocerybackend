import { connectDatabase } from "../database/db";
import mongoose from 'mongoose';
beforeAll(async () => {
    await connectDatabase();
});

afterAll(async () => {
    // Add any teardown logic if necessary
    await mongoose.connection.close();
});