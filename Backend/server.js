import express from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authroutes.js";
import connectDB from "./Database/db.js";
import cors from "cors";
import problemRoutes from "./Routes/problemroutes.js";
import contestroutes from "./Routes/contestroutes.js";
import submissionroutes from "./Routes/submissionroutes.js";
import airoutes from "./Routes/ai.js";

dotenv.config();
const app = express();

connectDB();

app.use(cors({
  origin: "https://randomcompile.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/contests", contestroutes);
app.use("/api/submissions", submissionroutes);
app.use("/api/ai", airoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend is alive!" });
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
