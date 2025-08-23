import { Schema, model, Document, Types } from 'mongoose';
import { TaskStatus, TaskPriority } from '../types/dtos';
import { ProjectModel } from './Project';
import { UserModel } from './User';

// Define the Task document interface.
export interface TaskModel extends Document {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    project: Types.ObjectId;
    assignedTo: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Define the Mongoose Schema for the Task model.
const taskSchema = new Schema<TaskModel>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.Pending,
    },
    priority: {
        type: String,
        enum: Object.values(TaskPriority),
        default: TaskPriority.Medium,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
}, { timestamps: true });

const Task = model<TaskModel>('Task', taskSchema);
export default Task;