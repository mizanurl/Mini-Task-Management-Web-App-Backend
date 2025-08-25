// File: src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectToDatabase } from './database';
import { setupSwagger } from './swagger'; // Import the Swagger setup

import { AuditLogRouter } from './Controllers/AuditLogController'; // Import the AuditLog Router
import { UserRouter } from './Controllers/UserController'; // Import the User Router
import { ProjectRouter } from './Controllers/ProjectController'; // Import the Project Router
import { TaskRouter } from './Controllers/TaskController'; // Import the Task Router

import { User } from './types/user';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // We'll restrict this in a production environment
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

const PORT = process.env.PORT || 3000;

// A Map to store online users by their ID and socket ID.
const onlineUsers = new Map<string, User>();
const userIdToSocketId = new Map<string, string>();

// Middleware setup.
app.use(cors());
app.use(express.json());

// Set up Swagger API documentation.
setupSwagger(app);

// Use the routers for your API endpoints.
app.use('/api/auditlogs', AuditLogRouter());
app.use('/api/users', UserRouter(io));
app.use('/api/projects', ProjectRouter(io));
app.use('/api/tasks', TaskRouter(io));

// We'll also add a few public routes here later if needed.

// Main function to start the server.
const startServer = async () => {
    try {
        await connectToDatabase();
        
        // This is the core logic for user presence
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            socket.on('userOnline', (user: User) => {
                (socket as any).userId = user.id;
                onlineUsers.set(user.id, user);
                userIdToSocketId.set(user.id, socket.id);
                io.emit('userList', Array.from(onlineUsers.values()));
                console.log(`User ${user.username} is now online. Total: ${onlineUsers.size}`);
            });

            socket.on('userOffline', (userId: string) => {
                onlineUsers.delete(userId);
                userIdToSocketId.delete(userId);
                io.emit('userList', Array.from(onlineUsers.values()));
                console.log(`User ${userId} is now offline. Total: ${onlineUsers.size}`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                const userId = (socket as any).userId;
                if (userId) {
                    onlineUsers.delete(userId);
                    userIdToSocketId.delete(userId);
                    io.emit('userList', Array.from(onlineUsers.values()));
                    console.log(`User ${userId} disconnected. Total: ${onlineUsers.size}`);
                }
            });
        });

        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server due to database connection error:', error);
    }
};

startServer();