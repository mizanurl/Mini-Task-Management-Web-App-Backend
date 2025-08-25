// File: src/Controllers/AuditLogController.ts

import { Router, Request, Response } from 'express';
import { AuditLogService } from '../Services/AuditLogService';
import authMiddleware from '../Middleware/AuthMiddleware';

// Instantiate the service.
const auditLogService = new AuditLogService();

export const AuditLogRouter = () => {
    const router = Router();

    /**
     * @swagger
     * tags:
     *   - name: Audit Logs
     *     description: System audit trail for Admin users
     */
    
    // All routes in this router require authentication and Admin role.
    router.use(authMiddleware);
    router.use((req, res, next) => {
        if (req.user?.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: Only admin can access audit logs.' });
        }
        next();
    });
     
    /**
     * @swagger
     * /api/auditlogs:
     *   get:
     *     summary: Get a list of all audit logs (Admin only)
     *     tags: [Audit Logs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of audit log entries
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/AuditLog'
     *       403:
     *         description: Forbidden, user is not authorized to access this resource
     *       500:
     *         description: Server error
     */
    router.get('/', authMiddleware, async (req: Request, res: Response) => {
        try {
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
            }
            const logs = await auditLogService.getAllLogs();
            res.json(logs);
        } catch (error) {
            console.error('Failed to get audit logs:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    return router;
};