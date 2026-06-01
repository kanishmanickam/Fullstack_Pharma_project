import express from 'express';
import { protect } from '../middleware/auth.js';
import { Alert } from '../models/alertModel.js';
import log from '../utils/logger.js';

const router = express.Router();

// GET /api/notifications - returns recent unresolved alerts as notifications
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await Alert.find({ isResolved: false })
            .sort({ createdAt: -1 })
            .limit(20);

        const notifications = alerts.map(alert => ({
            _id: alert._id,
            type: alert.alertType,
            message: alert.message,
            severity: alert.severity,
            medicineName: alert.medicineName,
            createdAt: alert.createdAt,
        }));

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        log('ERROR', 'Get notifications error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
});

export default router;
