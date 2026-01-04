import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export async function connectDatabase(){
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}