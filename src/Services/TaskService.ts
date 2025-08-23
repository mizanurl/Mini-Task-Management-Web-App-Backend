import { ProjectDatabase } from '../Repository/MongoDB/ProjectDatabase';
import { TaskDatabase } from '../Repository/MongoDB/TaskDatabase';
import { TaskModel } from '../Models/Task';
import { AuditLogService } from '../Services/AuditLogService';
import { CreateTaskDtoInterface, UpdateTaskDtoInterface } from '../types/dtos';
import { Server as SocketIOServer } from 'socket.io';

const projectRepository = new ProjectDatabase();
const taskRepository = new TaskDatabase();
const auditLogService = new AuditLogService();

export class TaskService {
    private io: SocketIOServer;

    constructor(io: SocketIOServer) {
        this.io = io;
    }
    
    /**
     * Creates a new task and notifies the assigned member (Manager action).
     * @param taskDto The task data.
     * @param managerId The ID of the manager creating the task.
     */
    public async createTask(taskDto: CreateTaskDtoInterface, managerId: string): Promise<TaskModel> {

        const newTask = await taskRepository.createTask(taskDto);

        // Log the action.
        await auditLogService.logAction(
            'TASK_CREATED',
            managerId,
            (newTask._id as string | { toString(): string }).toString(),
            { taskId: newTask._id, assignedTo: newTask.assignedTo }
        );

        // Notify the assigned member.
        this.io.to((newTask.assignedTo as unknown as string).toString()).emit('newTaskAssigned', {
            message: `You have been assigned a new task: ${newTask.title}`,
            task: newTask,
        });

        // Notify other relevant users (e.g., project managers, admins).
        // This will be handled by broadcasting to a "project room" later.
        
        return newTask;
    }

    /**
     * Updates an existing task and notifies relevant parties.
     * @param userId The ID of the user updating the task.
     * @param taskId The ID of the task to update.
     * @param update The partial update object.
     */
    public async updateTask(
        userId: string,
        taskId: string,
        updateData: UpdateTaskDtoInterface
    ): Promise<TaskModel | null> {

        const task = await taskRepository.findById(taskId);

        if (!task) {
            return null;
        }

        // Update the task with the new fields
        if (updateData.title !== undefined) task.title = updateData.title;
        if (updateData.description !== undefined) task.description = updateData.description;
        if (updateData.assignedTo !== undefined) {
            // Convert string to ObjectId if necessary
            const { ObjectId } = require('mongodb');
            task.assignedTo = typeof updateData.assignedTo === 'string'
                ? new ObjectId(updateData.assignedTo)
                : updateData.assignedTo;
        }
        if (updateData.status !== undefined) task.status = updateData.status;
        if (updateData.priority !== undefined) task.priority = updateData.priority;

        const updatedTask = await taskRepository.updateTask(taskId, task);

        // Check if updatedTask exists and its project property before trying to use it.
        if (updatedTask && updatedTask.project) {
            // Log the action.
            await auditLogService.logAction(
                'TASK_UPDATED',
                userId,
                taskId,
                { updates: updateData }
            );
            
            // Emit a real-time event to everyone in the project.
            this.io.to((updatedTask.project as string | { toString(): string }).toString()).emit('taskUpdated', {
                taskId: updatedTask._id,
                updatedFields: updateData
            });
        }
        return updatedTask;
    }

    /**
     * Finds a task by its ID.
     * @param taskId - The ID of the task to find.
     * @returns The found task or null if not found.
     */
    public async getTaskById(taskId: string): Promise<TaskModel | null> {
        return taskRepository.findById(taskId);
    }

    /**
     * Finds all tasks assigned to a specific user.
     * @param userId - The ID of the user to find tasks for.
     * @returns An array of tasks assigned to the user.
     */
    public async findTasksByAssignedUser(userId: string): Promise<TaskModel[]> {
        return taskRepository.findAllByAssignedUser(userId);
    }

    /**
     * Finds all tasks.
     * @returns An array of all tasks.
     */
    public async findAllTasks(): Promise<TaskModel[]> {
        return taskRepository.findAll();
    }

    /**
     * Finds all tasks assigned to a specific manager.
     * @param managerId - The ID of the manager to find tasks for.
     * @returns An array of tasks assigned to the manager.
     */
    public async findTasksByManager(managerId: string): Promise<TaskModel[]> {
        // First, find all projects the user manages.
        const projects = await projectRepository.findAllByManager(managerId);
        const projectIds = projects.map(p => (p._id as string | { toString(): string }).toString());
        
        // Then, find all tasks within those projects.
        return taskRepository.findAllByProjects(projectIds);
    }
}