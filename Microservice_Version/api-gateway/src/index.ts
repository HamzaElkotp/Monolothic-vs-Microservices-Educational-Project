import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import * as crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_microservice_key';

app.use(cors());
// Note: We don't use express.json() globally here because http-proxy-middleware 
// needs the raw stream if we don't use fixRequestBody. If we need to parse 
// bodies locally (e.g., for JWT verification on specific fields), we'd need it.
// Here we'll just check headers.

// 1. Correlation ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    console.log(`[API Gateway] ${req.method} ${req.url} - CorrID: ${correlationId}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

// 2. JWT Verification Middleware
// We define paths that don't need authentication (e.g., login, register, getting products).
const publicPaths = ['/api/users/login', '/api/users/register'];

// We can also allow all GETs to /api/products, etc. For simplicity, we create a function.
const requiresAuth = (req: Request) => {
    if (publicPaths.includes(req.path)) return false;
    if (req.path.startsWith('/api/products') && req.method === 'GET') return false;
    return true; // Everything else requires auth
};

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    if (!requiresAuth(req)) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required by Gateway' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token detected by Gateway' });
        }

        // Pass user details to downstream services securely if desired
        // e.g., req.headers['x-user-id'] = (decoded as any).id;

        next();
    });
};

app.use(verifyJWT);

// 3. Proxy Middleware
// User Service
app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' }
}));

// Product Service
app.use('/api/products', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '' }
}));

// Cart Service
app.use('/api/carts', createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/carts': '' }
}));

// Order Service
app.use('/api/orders', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' }
}));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Gateway Error:', err.message);
    res.status(500).json({ error: 'API Gateway Error' });
});

app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});
