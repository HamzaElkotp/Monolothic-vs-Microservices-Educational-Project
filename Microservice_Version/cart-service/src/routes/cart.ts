import express, { Router } from 'express';
import axios from 'axios';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002';

// Middleware to ensure user is authenticated
router.use(authenticateToken as express.RequestHandler);

// Get user's cart
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        let cart = await prisma.cart.findFirst({
            where: { userId },
            include: { items: true }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: true }
            });
        }

        // Enrich cart items with product info from Product Service
        const enrichedItems = await Promise.all(cart.items.map(async (item: any) => {
            try {
                // HTTP call to the Product microservice
                const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/${item.productId}`);
                return { ...item, product: productRes.data };
            } catch (err) {
                return { ...item, product: { name: 'Unknown', price: 0 } };
            }
        }));

        res.json({ ...cart, items: enrichedItems });
    } catch (error) {
        console.error(error);
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
                data: { quantity: existingItem.quantity + (quantity || 1) }
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity: quantity || 1 }
            });
        }

        res.status(200).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Remove item from cart
router.delete('/items/:itemId', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const itemId = parseInt(req.params.itemId as string);

        const cart = await prisma.cart.findFirst({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        await prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id }
        });

        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

export default router;
