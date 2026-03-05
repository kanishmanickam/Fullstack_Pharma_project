import { AuditLog } from '../models/index.js';
import log from '../utils/logger.js';

// GET /api/audit — paginated, filterable audit log (owner only)
export const getAuditLogs = async (req, res) => {
    try {
        const {
            username,
            module,
            action,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};

        if (username) {
            filter.username = { $regex: username, $options: 'i' };
        }
        if (module) filter.module = module;
        if (action) filter.action = action;

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.timestamp.$lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AuditLog.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit),
            logs,
        });
    } catch (error) {
        log('ERROR', 'Get audit logs error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message,
        });
    }
};

// GET /api/audit/stats — summary counts for page header
export const getAuditStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, todayCount, byModule, byAction] = await Promise.all([
            AuditLog.countDocuments(),
            AuditLog.countDocuments({ timestamp: { $gte: today } }),
            AuditLog.aggregate([
                { $group: { _id: '$module', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            AuditLog.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        const topModule = byModule[0]?._id || 'N/A';

        res.status(200).json({
            success: true,
            stats: {
                total,
                todayCount,
                topModule,
                byModule,
                byAction,
            },
        });
    } catch (error) {
        log('ERROR', 'Get audit stats error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error fetching audit stats',
            error: error.message,
        });
    }
};
