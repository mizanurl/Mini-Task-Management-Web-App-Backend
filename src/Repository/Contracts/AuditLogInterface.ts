import { AuditLogModel } from '../../Models/AuditLog';

export interface AuditLogInterface {

    /**
     * Create a new audit log entry.
     * @param log - The audit log data to create.
     * @returns The created audit log entry.
     */
    createLog(log: Omit<AuditLogModel, '_id'>): Promise<AuditLogModel>;
}