import { ProjectDatabase } from '../Repository/MongoDB/ProjectDatabase';
import { AuditLogService } from '../Services/AuditLogService';
import { ProjectModel } from '../Models/Project';
import { Server as SocketIOServer } from 'socket.io';
import { CreateProjectDtoInterface } from '../types/dtos';

const projectRepository = new ProjectDatabase();
const auditLogService = new AuditLogService();

export class ProjectService {
    private io: SocketIOServer;

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    /**
     * Creates a new project (Admin action).
     * @param projectDto The project data to be created.
     * @param ownerId The ID of the admin creating the project.
     */
    public async createProject(
        projectDto: CreateProjectDtoInterface,
        ownerId: string
    ): Promise<ProjectModel> {
        // We now pass the DTO and ownerId directly to the repository.
        const newProject = await projectRepository.createProject(projectDto, ownerId);

        // The rest of your code is correct and will work as expected.
        await auditLogService.logAction(
            'PROJECT_CREATED',
            ownerId,
            (newProject._id as string).toString(),
            { projectId: newProject._id, projectName: newProject.name }
        );


        return newProject;
    }

    /**
     * Assigns a manager to a project (Admin action).
     * @param adminId The ID of the admin.
     * @param projectId The ID of the project.
     * @param managerId The ID of the manager to assign.
     */
    public async assignManager(
        adminId: string,
        projectId: string,
        managerId: string
    ): Promise<ProjectModel | null> {
        const project = await projectRepository.assignManager(projectId, managerId);

        // Log the assignment.
        if (project) {
            await auditLogService.logAction(
                'MANAGER_ASSIGNED_TO_PROJECT',
                adminId,
                projectId,
                { managerId, projectId }
            );
        }
        return project;
    }

    /**
     * Deletes a project and its associated tasks (Admin action).
     * @param adminId The ID of the admin.
     * @param projectId The ID of the project to delete.
     */
    public async deleteProject(adminId: string, projectId: string): Promise<void> {
        await projectRepository.deleteProject(projectId);

        // Log the deletion.
        await auditLogService.logAction(
            'PROJECT_DELETED',
            adminId,
            projectId,
            { projectId }
        );

        // Notify all relevant users about the deletion.
        this.io.emit('projectDeleted', { projectId });
    }
    
   /**
    * Finds all projects.
    * @returns An array of all projects.
    */
    public async findAllProjects(): Promise<ProjectModel[]> {
        return projectRepository.findAll();
    }

    /**
     * Finds all projects by a manager.
     * @param managerId - The ID of the manager to find projects for.
     * @returns An array of projects managed by the specified manager.
     */
    public async findProjectsByManager(managerId: string): Promise<ProjectModel[]> {
        return projectRepository.findAllByManager(managerId);
    }
}