import { TaskModel } from '../../Models/Task';
import { CreateTaskDtoInterface } from '../../types/dtos';

export interface TaskInterface {

    /**
     * Create a new task.
     * @param task - The task data to create.
     * @returns The created task.
     */
    createTask(taskDto: CreateTaskDtoInterface): Promise<TaskModel>;

    /**
     * Find a task by its ID.
     * @param id - The ID of the task to find.
     * @returns The found task or null if not found.
     */
    findById(id: string): Promise<TaskModel | null>;

    /**
     * Find all tasks by their project ID.
     * @param projectId - The ID of the project to find tasks for.
     * @returns An array of tasks belonging to the project.
     */
    findAllByProject(projectId: string): Promise<TaskModel[]>;

    /**
     * Find all tasks assigned to a specific user.
     * @param userId - The ID of the user to find tasks for.
     * @returns An array of tasks assigned to the user.
     */
    findAllByAssignedUser(userId: string): Promise<TaskModel[]>;

    /**
     * Update a task by its ID.
     * @param id - The ID of the task to update.
     * @param update - The updated task data.
     * @returns The updated task or null if not found.
     */
    updateTask(id: string, update: Partial<TaskModel>): Promise<TaskModel | null>;
}