import express from 'express';
import dotenv from 'dotenv';
import { mvnRoute } from './routes/mvn';
import { vpnRoute } from './routes/vpn';

dotenv.config();

const app = express();

// Middleware and route configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());

app.use("/vpn", vpnRoute);
app.use("/mvn", mvnRoute);


app.get('/', (req, res) => {
    res.send('Hello from Mock Express API!');
});

export default app;