import { Schema, model, Document } from 'mongoose';

// Define the User document interface for TypeScript.
export interface UserModel extends Document {
    username: string;
    email: string;
    password?: string;
    role: 'Admin' | 'Manager' | 'Member';
}

// Define the Mongoose Schema for the User model.
const userSchema = new Schema<UserModel>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Member'],
        default: 'Member',
        required: true,
    },
}, { timestamps: true });

const User = model<UserModel>('User', userSchema);
export default User;