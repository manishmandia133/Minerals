import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";
import queryRouter from "./routes/query.routes.js";
import ingestionRouter from "./routes/ingestion.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/query", queryRouter);
app.use("/api/v1/ingestion", ingestionRouter);

app.use(errorHandler);

export default app;