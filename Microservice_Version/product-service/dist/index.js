"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_1 = __importDefault(require("./routes/product"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[Product Service] ${req.method} ${req.url}`);
    next();
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'product-service' });
});
app.use('/', product_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Product Service Error' });
});
app.listen(port, () => {
    console.log(`Product service listening on port ${port}`);
});
