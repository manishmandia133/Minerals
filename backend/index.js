import 'dotenv/config';
import app from './src/app.js';
import pool from './src/config/db.js';

const port = process.env.PORT || 5000;

app.get("/test-db", async (req,res)=>{
    try{
        const result = await pool.query('SELECT NOW()');
        res.send(`Database is connected, Server Time: ${result.rows[0].now}`)
    }catch(err){
        console.error(err);
        res.status(500).send("Database connection failed");

    }
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
