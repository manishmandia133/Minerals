import app from "./server/app.js";
import { pool } from "./db/db.js";

const PORT = process.env.PORT || 8000;

async function startServer() {
    try {
        await pool.query("SELECT 1");

        console.log("Database connected");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();
