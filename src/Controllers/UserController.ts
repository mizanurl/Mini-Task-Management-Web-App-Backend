// File: src/Controllers/UserController.ts
import { Router, Request, Response } from 'express';
import { UserService } from '../Services/UserService';
import { TaskService } from '../Services/TaskService';
import { AuditLogService } from '../Services/AuditLogService';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import authMiddleware from '../Middleware/AuthMiddleware';
import { ChangeRoleDtoInterface } from '../types/dtos';

export const UserRouter = (io: SocketIOServer) => {
    const router = Router();
    const userService = new UserService(io);
    const taskService = new TaskService(io);
    const auditLogService = new AuditLogService();

    /**
     * @swagger
     * tags:
     *   - name: Users
     *     description: User management and authentication
     */

    /**
     * @swagger
     * /api/users/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *               - role
     *             properties:
     *               username:
     *                 type: string
     *                 description: Username for the new account
     *               email:
     *                 type: string
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 description: User's password
     *               role:
     *                 type: string
     *                 enum: [Admin, Manager, Member]
     *                 description: Role assigned to the user
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: User already exists
     *       500:
     *         description: Server error
     */
    router.post('/register', async (req: Request, res: Response) => {
        try {
            const user = await userService.registerUser(req.body);
            // In a real-world scenario, you might not return the full user object.
            res.status(201).json({ message: 'User registered successfully', userId: user._id });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/users/login:
     *   post:
     *     summary: Log in a user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 description: User's password
     *     responses:
     *       200:
     *         description: Login successful, returns a JWT token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: JWT access token
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       400:
     *         description: Invalid credentials
     *       500:
     *         description: Server error
     */
    router.post('/login', async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const user = await userService.loginUser(email, password);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token.
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({ token, user });
    });

    /**
     * @swagger
     * /api/users/role:
     *   put:
     *     summary: Change a user's role dynamically (Admin only)
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - newRole
     *             properties:
     *               userId:
     *                 type: string
     *                 description: ID of the user to update
     *               newRole:
     *                 type: string
     *                 enum: [Admin, Manager, Member]
     *                 description: New role to assign to the user
     *     responses:
     *       200:
     *         description: Role updated successfully
     *       401:
     *         description: Unauthorized, missing or invalid token
     *       403:
     *         description: Forbidden, only Admins can change roles
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    router.put('/role', authMiddleware, async (req: Request, res: Response) => {
        try {
            // Check if the authenticated user is an Admin
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ message: 'Forbidden: Only Admins can change user roles.' });
            }

            const { userId, role } = req.body as ChangeRoleDtoInterface;
            
            // Call the service to change the user's role
            const updatedUser = await userService.updateRole(req.user.id.toString(), userId, role);
            
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Emit a real-time update
            io.emit('roleUpdated', { userId: updatedUser._id, newRole: updatedUser.role });

            // Log the action for the audit trail
            await auditLogService.logAction(
                'ROLE_UPDATED',
                req.user!.id.toString(),
                userId,
                { oldRole: updatedUser.role, newRole: role }
            );
            
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error changing user role:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    return router;
};