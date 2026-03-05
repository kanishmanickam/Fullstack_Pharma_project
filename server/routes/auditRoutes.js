import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getAuditLogs, getAuditStats } from '../controllers/auditController.js';

const router = express.Router();

// All audit routes: owner-only, read-only
// No POST / PUT / DELETE routes — AuditLogs are immutable
router.get('/stats', protect, authorize('owner'), getAuditStats);
router.get('/', protect, authorize('owner'), getAuditLogs);

export default router;
