// File: src/Controllers/ProjectController.ts
import { Router, Request, Response } from 'express';
import { ProjectService } from '../Services/ProjectService';
import authMiddleware from '../Middleware/AuthMiddleware';
import { Server as SocketIOServer } from 'socket.io';
import { ProjectModel } from '../Models/Project';
import { CreateProjectDtoInterface } from '../types/dtos';

export const ProjectRouter = (io: SocketIOServer) => {
    const router = Router();
    const projectService = new ProjectService(io);

    /**
     * @swagger
     * tags:
     *   - name: Projects
     *     description: Project management for Admins
     */
    
    // All routes in this router require authentication and Admin role.
    router.use(authMiddleware);
    router.use((req, res, next) => {
        if (req.user?.role === 'Member') {
            return res.status(403).json({ message: 'Forbidden: Only admins and managers can access project information.' });
        }
        next();
    });

    /**
     * @swagger
     * /api/projects:
     *   post:
     *     summary: Create a new project (Admin only)
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 description: The name of the project
     *               description:
     *                 type: string
     *                 description: The description of the project
     *     responses:
     *       201:
     *         description: Project created successfully
     *       403:
     *         description: Forbidden, user is not an Admin
     *       500:
     *         description: Server error
     */
    router.post('/', async (req: Request, res: Response) => {
        try {
            // Cast the request body to the DTO. This is the only type assertion needed here.
            const projectDto = req.body as CreateProjectDtoInterface;

            // Pass the DTO and the user ID directly to the service.
            const newProject = await projectService.createProject(projectDto, req.user!.id.toString());
            
            res.status(201).json(newProject);
        } catch (error) {
            console.error('Project creation error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/projects/{id}:
     *   delete:
     *     summary: Delete a project (Admin only)
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The Project ID
     *     responses:
     *       200:
     *         description: Project deleted successfully
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Project not found
     *       500:
     *         description: Server error
     */
    router.delete('/:id', async (req: Request, res: Response) => {
        try {
            await projectService.deleteProject(req.user!.id.toString(), req.params.id);
            res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
            console.error('Project deletion error:', error);
            res.status(404).json({ message: 'Project not found' });
        }
    });

    /**
     * @swagger
     * /api/projects:
     *   get:
     *     summary: Get all projects (For Admin & Manager)
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of projects
     *       403:
     *         description: Forbidden, user is not an Admin
     */
    router.get('/', async (req: Request, res: Response) => {
        try {

            let projects;

            //console.log('USER ROLE:', req.user?.role);
            
            if (req.user?.role === 'Admin') {
                projects = await projectService.findAllProjects();
            } else if (req.user?.role === 'Manager') {
                //console.log('Fetching projects for manager:', req.user.id);
                projects = await projectService.findProjectsByManager(req.user.id.toString());
            } else {
                // Members should not be able to view projects directly
                return res.status(403).json({ message: 'Forbidden: You do not have permission to view projects.' });
            }

            res.json(projects);
        } catch (error) {
            console.error('Fetching projects error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/projects/assign-manager:
     *   put:
     *     summary: Assign a manager to a project (Admin only)
     *     tags: [Projects]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               projectId:
     *                 type: string
     *               managerId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Project updated successfully
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Project not found
     *       500:
     *         description: Server error
     */
    router.put('/assign-manager', async (req: Request, res: Response) => {
        try {
            
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to assign managers.' });
            }            
            
            const { projectId, managerId } = req.body;
            const updatedProject = await projectService.assignManager(
                req.user!.id.toString(),
                projectId,
                managerId
            );
            
            if (!updatedProject) {
                return res.status(404).json({ message: 'Project not found or manager could not be assigned.' });
            }
            
            res.status(200).json(updatedProject);
        } catch (error) {
            console.error('Error assigning manager:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    return router;
};