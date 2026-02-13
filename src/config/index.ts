import dotenv from 'dotenv';
dotenv.config();

export const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:3000';
//load env variables

export const PORT:number =
 process.env.PORT ? parseInt(process.env.PORT) : 5000;
 //ensure that the port is a number ,and fallback if not found
 //avoid exception if env is missing

 export const MONGO_URI:string =
 process.env.MONGO_URI || "mongodb://localhost:27017/Minigrocery_backend";


 export const JWT_SECRET:string =
 process.env.JWT_SECRET || "merosecret";
 //fallback to local mongodb if env is mmissing

 //applications level CONSTANTS