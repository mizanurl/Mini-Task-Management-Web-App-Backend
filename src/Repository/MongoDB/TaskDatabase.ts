import Task, { TaskModel } from '../../Models/Task';
import { TaskInterface } from '../Contracts/TaskInterface';
import { CreateTaskDtoInterface } from '../../types/dtos';

export class TaskDatabase implements TaskInterface {

    /**
     * Create a new task.
     * @param task - The task data to create.
     * @returns The created task.
     */
    public async createTask(taskDto: CreateTaskDtoInterface): Promise<TaskModel> {
        
        const newTask = new Task({
            title: taskDto.title,
            description: taskDto.description,
            project: taskDto.projectId,
            assignedTo: taskDto.assignedTo,
            status: taskDto.status,
            priority: taskDto.priority,
        });
        
        return newTask.save();
    }

    /**
     * Find a task by its ID.
     * @param id - The ID of the task to find.
     * @returns The found task or null if not found.
     */
    public async findById(id: string): Promise<TaskModel | null> {
        return Task.findById(id).populate('assignedTo').populate('project');
    }

    /**
     * Find all tasks.
     * @returns An array of all tasks.
     */
    public async findAll(): Promise<TaskModel[]> {
        return Task.find().populate('assignedTo').populate('project');
    }

    /**
     * Find all tasks by their project ID.
     * @param projectId - The ID of the project to find tasks for.
     * @returns An array of tasks belonging to the project.
     */
    public async findAllByProject(projectId: string): Promise<TaskModel[]> {
        return Task.find({ project: projectId }).populate('assignedTo');
    }

    /**
     * Find all tasks by their project IDs.
     * @param projectIds - The IDs of the projects to find tasks for.
     * @returns An array of tasks belonging to the projects.
     */
    public async findAllByProjects(projectIds: string[]): Promise<TaskModel[]> {
        return Task.find({ project: { $in: projectIds } }).populate('assignedTo').populate('project');
    }

    /**
     * Find all tasks assigned to a specific user.
     * @param userId - The ID of the user to find tasks for.
     * @returns An array of tasks assigned to the user.
     */
    public async findAllByAssignedUser(userId: string): Promise<TaskModel[]> {
        return Task.find({ assignedTo: userId }).populate('project');
    }

    /**
     * Update a task by its ID.
     * @param id - The ID of the task to update.
     * @param update - The updated task data.
     * @returns The updated task or null if not found.
     */
    public async updateTask(id: string, update: Partial<TaskModel>): Promise<TaskModel | null> {
        return Task.findByIdAndUpdate(id, update, { new: true });
    }
}