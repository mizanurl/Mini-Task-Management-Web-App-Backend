import { ProjectModel } from '../../Models/Project';
import { CreateProjectDtoInterface } from '../../types/dtos';

export interface ProjectInterface {

    /**
     * Create a new project.
     * @param project - The project data to create.
     * @returns The created project.
     */
    createProject(project: CreateProjectDtoInterface, ownerId: string): Promise<ProjectModel>;

    /**
     * Find a project by its ID.
     * @param id - The ID of the project to find.
     * @returns The found project or null if not found.
     */
    findById(id: string): Promise<ProjectModel | null>;

    /**
     * Find all projects.
     * @returns An array of all projects.
     */
    findAll(): Promise<ProjectModel[]>;

    /**
     * Delete a project by its ID.
     * @param id - The ID of the project to delete.
     * @returns A promise that resolves when the project is deleted.
     */
    deleteProject(id: string): Promise<void>;

    /**
     * Assign a manager to a project.
     * @param projectId - The ID of the project to update.
     * @param managerId - The ID of the manager to assign.
     * @returns The updated project or null if not found.
     */
    assignManager(projectId: string, managerId: string): Promise<ProjectModel | null>;
}