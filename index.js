import dotenv from "dotenv";
dotenv.config();

import express from "express"
import cors from "cors"
import videoRouter from "./src/routes/video.route.js"
import connectDb from "./src/database/connect.js";


const app = express();
const PORT = process.env.PORT || 8000;


app.use(cors({
    origin: ["http://localhost:3000",
        "http://localhost:5173"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/video", videoRouter)

//MongoDb connection
connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log("MongoDB connected succesfully !!");
            console.log(`Server started at port: ${PORT}`);

        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failed !!!", err);

    })