import { UserModel } from '../../Models/User';

export interface UserInterface {

    /**
     * Find a user by their email address.
     * @param email - The email address of the user to find.
     * @returns The found user or null if not found.
     */
    findByEmail(email: string): Promise<UserModel | null>;

    /**
     * Find a user by their ID.
     * @param id - The ID of the user to find.
     * @returns The found user or null if not found.
     */
    findById(id: string): Promise<UserModel | null>;

    /**
     * Create a new user.
     * @param user - The user data to create.
     * @returns The created user.
     */
    createUser(user: Omit<UserModel, '_id'>): Promise<UserModel>;

    /**
     * Update a user's role.
     * @param id - The ID of the user to update.
     * @param newRole - The new role to assign to the user.
     * @returns The updated user or null if not found.
     */
    updateRole(id: string, newRole: 'Admin' | 'Manager' | 'Member'): Promise<UserModel | null>;
}