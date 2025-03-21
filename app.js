import dotenv from "dotenv"
dotenv.config();

import express from "express"
import cors from "cors"
import "./config/connection.js"
import userRoutes from "./routes/user.routes.js"
export const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1/users", userRoutes);


app.get((req, res) => {
    res.send("Hello from Uber clone backend");
})


