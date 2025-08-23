import { UserDatabase } from '../Repository/MongoDB/UserDatabase';
// Update the import path if the file is located elsewhere, for example:
import { AuditLogService } from '../Services/AuditLogService';
// Or ensure that './AuditLogService.ts' exists in the same directory.
import { UserModel } from '../Models/User';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

// Instantiate the repositories and services.
const userRepository = new UserDatabase();
const auditLogService = new AuditLogService();

export class UserService {
    private io: SocketIOServer;

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    /**
     * Registers a new user.
     * @param userDto The user data, including username, email, password, and role.
     */
    public async registerUser(userDto: Omit<UserModel, '_id'>): Promise<UserModel> {
        // Hash the password before saving it to the database.
        const hashedPassword = await bcrypt.hash(userDto.password!, 10);
        const newUser = await userRepository.createUser({
            ...userDto,
            password: hashedPassword,
        });
        return newUser;
    }

    /**
     * Authenticates a user.
     * @param email The user's email.
     * @param password The user's password.
     * @returns The user object if authentication is successful, otherwise null.
     */
    public async loginUser(email: string, password?: string): Promise<UserModel | null> {
        const user = await userRepository.findByEmail(email);
        if (!user || !password) {
            return null;
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return null;
        }
        return user;
    }

    /**
     * Handles the dynamic role change for a user and emits a real-time event.
     * @param adminId The ID of the admin performing the action.
     * @param userId The ID of the user whose role is being changed.
     * @param newRole The new role to be assigned.
     * @returns The updated user object.
     */
    public async updateRole(
        adminId: string,
        userId: string,
        newRole: 'Admin' | 'Manager' | 'Member'
    ): Promise<UserModel | null> {
        const userToUpdate = await userRepository.findById(userId);
        if (!userToUpdate) {
            return null;
        }

        const oldRole = userToUpdate.role;
        const updatedUser = await userRepository.updateRole(userId, newRole);

        if (updatedUser) {
            // 1. Log the action.
            await auditLogService.logAction(
                'ROLE_CHANGE',
                adminId,
                userId,
                { oldRole, newRole }
            );

            // 2. Emit a real-time event.
            // We use the user's ID as the room to ensure only they get the update.
            this.io.to(userId.toString()).emit('roleUpdated', {
                userId: updatedUser._id,
                newRole: updatedUser.role,
            });
            console.log(`Role for user ${userId} updated and a real-time event was emitted.`);
        }
        return updatedUser;
    }
}