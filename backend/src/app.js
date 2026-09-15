import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import apiRoutes from './routes/index.js';


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', apiRoutes);


export default app;
