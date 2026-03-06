import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/order';

dotenv.config();

const app = express();
const port = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Order Service] ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'order-service' });
});

app.use('/', orderRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Order Service Error' });
});

app.listen(port, () => {
    console.log(`Order service listening on port ${port}`);
});
