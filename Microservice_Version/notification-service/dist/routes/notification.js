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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Mock endpoint to send an email notification
router.post('/send-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, subject, body } = req.body;
        console.log('--- EMAIL NOTIFICATION SENT ---');
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log('-------------------------------');
        // Log to database per Phase 1 microservice structure demands
        const notification = yield db_1.prisma.notification.create({
            data: { email, subject, body }
        });
        res.status(200).json({ message: 'Email notification logged successfully', notificationId: notification.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log notification' });
    }
}));
// Admin-level endpoint to view historical notifications
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield db_1.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}));
exports.default = router;
