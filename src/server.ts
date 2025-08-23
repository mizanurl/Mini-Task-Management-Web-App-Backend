// File: src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectToDatabase } from './database';
import { setupSwagger } from './swagger'; // Import the Swagger setup
import { UserRouter } from './Controllers/UserController'; // Import the User Router
import { ProjectRouter } from './Controllers/ProjectController'; // Import the Project Router
import { TaskRouter } from './Controllers/TaskController'; // Import the Task Router
import authMiddleware from './Middleware/AuthMiddleware'; // Import authMiddleware

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

// Middleware setup.
app.use(cors());
app.use(express.json());

// Set up Swagger API documentation.
setupSwagger(app);

// Use the routers for your API endpoints.
app.use('/api/users', UserRouter(io));
app.use('/api/projects', ProjectRouter(io));
app.use('/api/tasks', TaskRouter(io));

// We'll also add a few public routes here later if needed.

// Main function to start the server.
const startServer = async () => {
    try {
        await connectToDatabase();
        
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            // When a client connects, we need to associate their socket with their user ID.
            socket.on('joinRoom', (userId: string) => {
                socket.join(userId);
                console.log(`User ${userId} joined their personal room.`);
            });
            
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
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