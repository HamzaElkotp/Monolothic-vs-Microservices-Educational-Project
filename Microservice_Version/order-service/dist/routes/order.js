"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';
router.use(auth_1.authenticateToken);
router.post('/checkout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        // Fetch user's cart from Cart Service
        const token = req.headers['authorization'];
        const cartRes = yield axios_1.default.get(CART_SERVICE_URL, {
            headers: { Authorization: token }
        });
        const cart = cartRes.data;
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        let total = 0;
        const orderItems = cart.items.map((item) => {
            const price = item.product.price || 0;
            total += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price
            };
        });
        // Create the order
        const order = yield db_1.prisma.order.create({
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
            yield axios_1.default.delete(`${CART_SERVICE_URL}/items/${item.id}`, {
                headers: { Authorization: token }
            });
        }
        // Send email notification via Notification Service
        try {
            yield axios_1.default.post(`${NOTIFICATION_SERVICE_URL}/send-email`, {
                email: userEmail,
                subject: 'Order Confirmation',
                body: `Your order #${order.id} for $${order.total.toFixed(2)} was successful.`
            });
        }
        catch (err) {
            console.error('Failed to send notification via Notification Service', err);
        }
        res.status(201).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Checkout failed' });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const orders = yield db_1.prisma.order.findMany({
            where: { userId },
            include: { items: true }
        });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}));
exports.default = router;
