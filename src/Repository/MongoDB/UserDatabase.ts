import User, { UserModel } from '../../Models/User';
import { UserInterface } from '../Contracts/UserInterface';

export class UserDatabase implements UserInterface {

    /**
     * Find a user by their email address.
     * @param email - The email address of the user to find.
     * @returns The found user or null if not found.
     */
    public async findByEmail(email: string): Promise<UserModel | null> {
        return User.findOne({ email });
    }

    /**
     * Find a user by their ID.
     * @param id - The ID of the user to find.
     * @returns The found user or null if not found.
     */
    public async findById(id: string): Promise<UserModel | null> {
        return User.findById(id);
    }

    /**
     * Create a new user.
     * @param user - The user data to create.
     * @returns The created user.
     */
    public async createUser(user: Omit<UserModel, '_id'>): Promise<UserModel> {
        const newUser = new User(user);
        return newUser.save();
    }

    /**
     * Update a user's role.
     * @param id - The ID of the user to update.
     * @param newRole - The new role to assign to the user.
     * @returns The updated user or null if not found.
     */
    public async updateRole(id: string, newRole: 'Admin' | 'Manager' | 'Member'): Promise<UserModel | null> {
        return User.findByIdAndUpdate(id, { role: newRole }, { new: true });
    }
}