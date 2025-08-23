// File: src/Controllers/TaskController.ts
import { Router, Request, Response } from 'express';
import { TaskService } from '../Services/TaskService';
import authMiddleware from '../Middleware/AuthMiddleware';
import { Server as SocketIOServer } from 'socket.io';

export const TaskRouter = (io: SocketIOServer) => {
    const router = Router();
    const taskService = new TaskService(io);

    /**
     * @swagger
     * tags:
     *   - name: Tasks
     *     description: Task management for Managers and Members
     */
    router.use(authMiddleware);

    /**
     * @swagger
     * /api/tasks:
     *   post:
     *     summary: Create a new task (Manager only)
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - projectId
     *               - assignedTo
     *             properties:
     *               title:
     *                 type: string
     *                 description: Title of the task
     *               description:
     *                 type: string
     *                 description: Task description
     *               projectId:
     *                 type: string
     *                 description: Project ID this task belongs to
     *               assignedTo:
     *                 type: string
     *                 description: User ID of the assigned member
     *               status:
     *                 type: string
     *                 enum: [Pending, In Progress, Completed]
     *                 default: Pending
     *                 description: Current status of the task
     *               priority:
     *                 type: string
     *                 enum: [Low, Medium, High]
     *                 default: Medium
     *                 description: Priority of the task
     *     responses:
     *       201:
     *         description: Task created successfully
     *       403:
     *         description: Forbidden, user is not a Manager
     *       500:
     *         description: Server error
     */
    router.post('/', async (req: Request, res: Response) => {
        if (req.user?.role !== 'Manager') {
            return res.status(403).json({ message: 'Forbidden: Only managers can create tasks.' });
        }
        
        try {
            const newTask = await taskService.createTask(req.body, req.user.id.toString());
            res.status(201).json(newTask);
        } catch (error) {
            console.error('Task creation error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/tasks/{id}:
     *   put:
     *     summary: Update a task (Manager or assigned Member)
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The task ID.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: The new title of the task.
     *               description:
     *                 type: string
     *                 description: The new description of the task.
     *               assignedTo:
     *                 type: string
     *                 description: The new user to whom the task is assigned.
     *               status:
     *                 type: string
     *                 enum: [Pending, In Progress, Completed]
     *                 description: The new status of the task.
     *               priority:
     *                 type: string
     *                 enum: [Low, Medium, High]
     *                 description: The new priority of the task.
     *     responses:
     *       200:
     *         description: Task updated successfully
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Task not found
     *       500:
     *         description: Server error
     */
    router.put('/:id', async (req: Request, res: Response) => {
        const taskId = req.params.id;
        const userId = req.user!.id.toString();

        // Check if the user is a Manager or the assigned Member.
        // We'll need to fetch the task first to check this.
        const task = await taskService.getTaskById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        const isManager = req.user?.role === 'Manager';
        const isAssignedMember = task.assignedTo.toString() === userId;

        if (!isManager && !isAssignedMember) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this task.' });
        }

        try {
            const updatedTask = await taskService.updateTask(userId, taskId, req.body);
            res.json(updatedTask);
        } catch (error) {
            console.error('Task update error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/tasks:
     *   get:
     *     summary: Get all tasks
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of tasks
     *       403:
     *         description: Forbidden, user is not authorized
     *       500:
     *         description: Server error
     */
    router.get('/', async (req: Request, res: Response) => {
        try {
            let tasks;
            if (req.user?.role === 'Admin') {
                // Admins can see all tasks.
                tasks = await taskService.findAllTasks();
            } else if (req.user?.role === 'Manager') {
                // Managers can see all tasks from their assigned projects.
                tasks = await taskService.findTasksByManager(req.user.id.toString());
            } else { // Member
                // Members can only see tasks assigned to them.
                tasks = await taskService.findTasksByAssignedUser(req.user!.id.toString());
            }

            res.json(tasks);
        } catch (error) {
            console.error('Fetching tasks error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    return router;
};