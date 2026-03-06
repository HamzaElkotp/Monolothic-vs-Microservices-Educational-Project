import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notification';

dotenv.config();

const app = express();
const port = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Notification Service] ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'notification-service' });
});

app.use('/', notificationRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Notification Service Error' });
});

app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
});
