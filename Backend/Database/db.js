import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    } catch (err) {
      console.log("Database connection error: ",err.message);
      process.exit(1);
    }
  };

export default connectDB;