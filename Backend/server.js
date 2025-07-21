import express from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authroutes.js";
import connectDB from "./Database/db.js";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(bodyParser.json());


app.listen(8000, () =>{
    console.log(("Server running on port 8000"))
});


