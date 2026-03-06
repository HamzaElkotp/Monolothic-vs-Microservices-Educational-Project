import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Used for authenticated routes
router.use(authenticateToken);

// Get user's active cart or create one
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        let cart = await prisma.cart.findFirst({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } }
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/items', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { productId, quantity } = req.body;

        let cart = await prisma.cart.findFirst({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity }
            });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Remove item from cart
router.delete('/items/:itemId', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { itemId } = req.params;

        const cart = await prisma.cart.findFirst({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        await prisma.cartItem.deleteMany({
            where: { id: Number(itemId), cartId: cart.id }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

export default router;
