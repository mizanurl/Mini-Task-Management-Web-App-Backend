import AuditLog, { AuditLogModel } from '../../Models/AuditLog';
import { AuditLogInterface } from '../Contracts/AuditLogInterface';

export class AuditLogDatabase implements AuditLogInterface {

    /**
     * Create a new audit log entry.
     * @param log - The log data to create.
     * @returns The created log entry.
     */
    public async createLog(log: Omit<AuditLogModel, '_id'>): Promise<AuditLogModel> {
        const newLog = new AuditLog(log);
        return newLog.save();
    }
}