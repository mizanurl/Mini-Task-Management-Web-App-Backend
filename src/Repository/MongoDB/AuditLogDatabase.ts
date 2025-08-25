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

    /**
     * Find all audit log entries.
     * @returns An array of all audit log entries.
     */
    public async findAll(): Promise<AuditLogModel[]> {
        return AuditLog.find().sort({ timestamp: -1 }); // Sort by newest first
    }
}