import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
    collection: 'users',
    timestamps: true,
})
export class User {
    @Prop({ required: true, trim: true})
    name: string;

    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ type: String, required: true, enum: UserRole, default: UserRole.Analyst, })
    role: UserRole;

    @Prop()
    refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);