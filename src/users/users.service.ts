import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { hash } from 'bcryptjs';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ){}
    async createUser(data: CreateUserRequest){
        await new this.userModel({
            ...data,
            password: await hash(data.password, 10),
        }).save();
    }
    async getUser(query: FilterQuery<User>){
         const user = await this.userModel.findOne(query);
         if(!user){
            throw new NotFoundException('User Not found');
         }
         return user;
    }
    async getUsers(){
        return await this.userModel.find({});
    }
    async updateUser(
        query: FilterQuery<User>,
        update: UpdateQuery<User>,
    ){
        return await this.userModel.findOneAndUpdate(query, update);
    }
}
