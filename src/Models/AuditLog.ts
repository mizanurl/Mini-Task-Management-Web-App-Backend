import { Schema, model, Document } from 'mongoose';

// Define the AuditLog document interface.
export interface AuditLogModel extends Document {
    action: string;
    actorId: string; // The user who performed the action
    targetId?: string; // The user/project/task affected
    details: any; // Additional details of the event
    timestamp: Date;
}

// Define the Mongoose Schema for the AuditLog model.
const auditLogSchema = new Schema<AuditLogModel>({
    action: {
        type: String,
        required: true,
    },
    actorId: {
        type: String,
        required: true,
    },
    targetId: {
        type: String,
        required: false,
    },
    details: {
        type: Schema.Types.Mixed,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const AuditLog = model<AuditLogModel>('AuditLog', auditLogSchema);
export default AuditLog;