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
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002';
// Middleware to ensure user is authenticated
router.use(auth_1.authenticateToken);
// Get user's cart
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        let cart = yield db_1.prisma.cart.findFirst({
            where: { userId },
            include: { items: true }
        });
        if (!cart) {
            cart = yield db_1.prisma.cart.create({
                data: { userId },
                include: { items: true }
            });
        }
        // Enrich cart items with product info from Product Service
        const enrichedItems = yield Promise.all(cart.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // HTTP call to the Product microservice
                const productRes = yield axios_1.default.get(`${PRODUCT_SERVICE_URL}/${item.productId}`);
                return Object.assign(Object.assign({}, item), { product: productRes.data });
            }
            catch (err) {
                return Object.assign(Object.assign({}, item), { product: { name: 'Unknown', price: 0 } });
            }
        })));
        res.json(Object.assign(Object.assign({}, cart), { items: enrichedItems }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
}));
// Add item to cart
router.post('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        let cart = yield db_1.prisma.cart.findFirst({ where: { userId } });
        if (!cart) {
            cart = yield db_1.prisma.cart.create({ data: { userId } });
        }
        const existingItem = yield db_1.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });
        if (existingItem) {
            yield db_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) }
            });
        }
        else {
            yield db_1.prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity: quantity || 1 }
            });
        }
        res.status(200).json({ message: 'Item added to cart' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add item' });
    }
}));
// Remove item from cart
router.delete('/items/:itemId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const itemId = parseInt(req.params.itemId);
        const cart = yield db_1.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            return res.status(404).json({ error: 'Cart not found' });
        yield db_1.prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id }
        });
        res.json({ message: 'Item removed' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
}));
exports.default = router;
