import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import morgan from "morgan";
import helmet from "helmet";
import ConnectDb from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";

dotenv.config()

// Database Connection 

ConnectDb()

// App Initialization 
const app = express()

// Define PORT 
const PORT = process.env.PORT || 3000


// MiddleWares

app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.use(express.json())
app.use(cookieParser());
app.use("*", cors())
app.use(morgan('dev'));
app.use(helmet({
    crossOriginResourcePolicy: false
}))

// Routers Define 

app.get("/", (req, res) => {
    res.send("Server is running")
})
// Router 
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);


app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`)
})