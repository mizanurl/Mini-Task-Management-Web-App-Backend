// src/types/dtos.ts
import { Types } from 'mongoose';

// Enums for task fields
export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

// Interface for the data coming in the request body to create a new project.
export interface CreateProjectDtoInterface {
    name: string;
    description?: string;
}

// Data Transfer Object for creating a new task
export interface CreateTaskDtoInterface {
    title: string;
    description?: string;
    projectId: string;
    assignedTo: string;
    status: TaskStatus;
    priority: TaskPriority;
}

// Data Transfer Object for updating a task
export interface UpdateTaskDtoInterface {
    title?: string;
    description?: string;
    assignedTo?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
}

// Data Transfer Object for changing a user's role
export interface ChangeRoleDtoInterface {
    userId: string;
    role: 'Admin' | 'Manager' | 'Member';
}