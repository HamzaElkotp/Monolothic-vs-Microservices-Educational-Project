"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const notification_1 = __importDefault(require("./routes/notification"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4005;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[Notification Service] ${req.method} ${req.url}`);
    next();
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'notification-service' });
});
app.use('/', notification_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Notification Service Error' });
});
app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
});
