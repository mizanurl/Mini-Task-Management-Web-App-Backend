// File: src/Middleware/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Extend the Express Request type to include the user property.
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: Types.ObjectId;
                role: 'Admin' | 'Manager' | 'Member';
            };
        }
    }
}

// Define the JWT payload interface.
interface JwtPayload {
    id: string;
    role: 'Admin' | 'Manager' | 'Member';
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Get the token from the Authorization header.
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token. We will use a secret key from an environment variable.
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // Attach the user's info to the request object.
        req.user = {
            id: new Types.ObjectId(decoded.id),
            role: decoded.role,
        };
        
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;