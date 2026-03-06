import express, { Router } from 'express';
import axios from 'axios';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';

router.use(authenticateToken as express.RequestHandler);

router.post('/checkout', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const userEmail = req.user!.email;

        // Fetch user's cart from Cart Service
        const token = req.headers['authorization'];
        const cartRes = await axios.get(CART_SERVICE_URL, {
            headers: { Authorization: token }
        });
        const cart = cartRes.data;

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let total = 0;
        const orderItems = cart.items.map((item: any) => {
            const price = item.product.price || 0;
            total += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price
            };
        });

        // Create the order
        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'COMPLETED',
                items: {
                    create: orderItems
                }
            },
            include: { items: true }
        });

        // Empty the cart in Cart Service
        for (const item of cart.items) {
            await axios.delete(`${CART_SERVICE_URL}/items/${item.id}`, {
                headers: { Authorization: token }
            });
        }

        // Send email notification via Notification Service
        try {
            await axios.post(`${NOTIFICATION_SERVICE_URL}/send-email`, {
                email: userEmail,
                subject: 'Order Confirmation',
                body: `Your order #${order.id} for $${order.total.toFixed(2)} was successful.`
            });
        } catch (err) {
            console.error('Failed to send notification via Notification Service', err);
        }

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: true }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

export default router;
