import { AuditLogDatabase } from '../Repository/MongoDB/AuditLogDatabase';
import { AuditLogModel } from '../Models/AuditLog';

// Dependency injection of the repository.
const auditLogRepository = new AuditLogDatabase();

export class AuditLogService {
    /**
     * Records a significant action in the audit log.
     * @param action The action performed (e.g., 'ROLE_CHANGE', 'TASK_CREATED').
     * @param actorId The ID of the user who performed the action.
     * @param targetId The ID of the user/entity affected.
     * @param details Additional details of the event.
     */
    public async logAction(
        action: string,
        actorId: string,
        targetId: string,
        details: any
    ) {
        try {
            await auditLogRepository.createLog({
                action,
                actorId,
                targetId,
                details,
                timestamp: new Date(),
            } as any);
            console.log(`Audit log created: ${action}`);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    /**
     * Get all audit logs.
     * @returns An array of audit log entries.
     */
    public async getAllLogs(): Promise<AuditLogModel[]> {
        return auditLogRepository.findAll();
    }
}