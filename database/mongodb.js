import mongoose from "mongoose";
import { configDotenv } from "dotenv";

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected successully...");
    } catch (error){
        console.log("Failed to connect to Database...");
        console.log(error);
    }
}

export default connectDB