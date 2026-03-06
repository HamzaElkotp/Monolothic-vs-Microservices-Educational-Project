import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cartRoutes from './routes/cart';

dotenv.config();

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Cart Service] ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'cart-service' });
});

app.use('/', cartRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Cart Service Error' });
});

app.listen(port, () => {
    console.log(`Cart service listening on port ${port}`);
});
