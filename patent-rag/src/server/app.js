import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware.js";
import queryRouter from "./routes/query.routes.js";
import ingestionRouter from "./routes/ingestion.routes.js";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://patent.mandia.tech"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));

app.use("/api/v1/query", queryRouter);
app.use("/api/v1/ingestion", ingestionRouter);

app.use(errorHandler);

export default app;
