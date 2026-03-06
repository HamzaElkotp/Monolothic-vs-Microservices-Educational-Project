import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Mock endpoint to send an email notification
router.post('/send-email', async (req, res) => {
    try {
        const { email, subject, body } = req.body;

        console.log('--- EMAIL NOTIFICATION SENT ---');
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log('-------------------------------');

        // Log to database per Phase 1 microservice structure demands
        const notification = await prisma.notification.create({
            data: { email, subject, body }
        });

        res.status(200).json({ message: 'Email notification logged successfully', notificationId: notification.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log notification' });
    }
});

// Admin-level endpoint to view historical notifications
router.get('/', async (req, res) => {
    try {
        const history = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
