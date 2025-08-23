import Project, { ProjectModel } from '../../Models/Project';
import { ProjectInterface } from '../Contracts/ProjectInterface';
import { CreateProjectDtoInterface } from '../../types/dtos';

export class ProjectDatabase implements ProjectInterface {

    /**
     * Create a new project.
     * @param project - The project data to create.
     * @returns The created project.
     */
    public async createProject(project: CreateProjectDtoInterface, ownerId: string): Promise<ProjectModel> {
        // Construct the document using a clean object. The Mongoose model handles the rest.
        const newProject = new Project({
            name: project.name,
            description: project.description,
            owner: ownerId,
            managers: [],
        });
        return newProject.save();
    }

    /**
     * Find a project by its ID.
     * @param id - The ID of the project to find.
     * @returns The found project or null if not found.
     */
    public async findById(id: string): Promise<ProjectModel | null> {
        return Project.findById(id).populate('owner').populate('managers');
    }

    /**
     * Find all projects.
     * @returns An array of all projects.
     */
    public async findAll(): Promise<ProjectModel[]> {
        return Project.find().populate('owner').populate('managers');
    }

    /**
     * Delete a project by its ID.
     * @param id - The ID of the project to delete.
     * @returns A promise that resolves when the project is deleted.
     */
    public async deleteProject(id: string): Promise<void> {
        await Project.findByIdAndDelete(id);
    }

    /**
     * Assign a manager to a project.
     * @param projectId - The ID of the project to update.
     * @param managerId - The ID of the manager to assign.
     * @returns The updated project or null if not found.
     */
    public async assignManager(projectId: string, managerId: string): Promise<ProjectModel | null> {
        return Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { managers: managerId } },
            { new: true }
        );
    }

    /**
     * Find all projects by a manager.
     * @param managerId - The ID of the manager to find projects for.
     * @returns An array of projects managed by the specified manager.
     */
    public async findAllByManager(managerId: string): Promise<ProjectModel[]> {
        return Project.find({ managers: managerId }).populate('owner').populate('managers');
    }
}