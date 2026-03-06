import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Create order from current cart (Checkout)
router.post('/checkout', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const cart = await prisma.cart.findFirst({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total and create order items
        let total = 0;
        const orderItemsData = cart.items.map((item: any) => {
            total += item.product.price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price
            };
        });

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // Clear the cart
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        // Mock Notification
        console.log(`[Notification Service Mock] Order ${order.id} total $${total} created for user ${req.user!.email}`);

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

// Get user's past orders
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

export default router;
