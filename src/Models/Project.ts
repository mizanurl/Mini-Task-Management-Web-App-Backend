import { Schema, model, Document } from 'mongoose';
import { UserModel } from './User';

// Define the Project document interface.
export interface ProjectModel extends Document {
    name: string;
    description: string;
    owner: UserModel['_id']; // Reference to the Admin who created it
    managers: UserModel['_id'][]; // Array of references to Manager users
}

// Define the Mongoose Schema for the Project model.
const projectSchema = new Schema<ProjectModel>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    managers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
}, { timestamps: true });

const Project = model<ProjectModel>('Project', projectSchema);
export default Project;