// File: src/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri: string = process.env.MONGODB_URI || '';

export const connectToDatabase = async (): Promise<void> => {
    try {
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }

        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB with Mongoose!');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the process if the connection fails
    }
};