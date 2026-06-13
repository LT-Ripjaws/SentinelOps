import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        const existingUser = await this.findByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(createUserDto.password, 10);

       return this.userModel.create({
            name: createUserDto.name,
            email: createUserDto.email,
            passwordHash,
            role: createUserDto.role
       })
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec(); }

    async setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
        await this.userModel.updateOne({ _id: userId }, { $set: { refreshTokenHash } }).exec(); }
}
