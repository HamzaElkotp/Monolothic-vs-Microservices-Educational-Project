"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const crypto = __importStar(require("crypto"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_microservice_key';
app.use((0, cors_1.default)());
// Note: We don't use express.json() globally here because http-proxy-middleware 
// needs the raw stream if we don't use fixRequestBody. If we need to parse 
// bodies locally (e.g., for JWT verification on specific fields), we'd need it.
// Here we'll just check headers.
// 1. Correlation ID Middleware
app.use((req, res, next) => {
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
const requiresAuth = (req) => {
    if (publicPaths.includes(req.path))
        return false;
    if (req.path.startsWith('/api/products') && req.method === 'GET')
        return false;
    return true; // Everything else requires auth
};
const verifyJWT = (req, res, next) => {
    if (!requiresAuth(req)) {
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required by Gateway' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
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
app.use('/api/users', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' }
}));
// Product Service
app.use('/api/products', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '' }
}));
// Cart Service
app.use('/api/carts', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/carts': '' }
}));
// Order Service
app.use('/api/orders', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' }
}));
app.use((err, req, res, next) => {
    console.error('Gateway Error:', err.message);
    res.status(500).json({ error: 'API Gateway Error' });
});
app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});
