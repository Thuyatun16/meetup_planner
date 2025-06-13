import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { hash } from 'bcryptjs';
import { ConflictException } from '@nestjs/common';
import { isStrongPassword } from 'class-validator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { pipe } from 'rxjs';
import { Friend } from 'src/friend/schema/friend-schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ){}
    async createUser(data: CreateUserRequest){
        const user = await this.userModel.findOne({email: data.email});
        if(user){
            throw new ConflictException('User already exists');
        }
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
    async updateUser(query: FilterQuery<User>,update: UpdateQuery<User>){
        const finalUpdate = {...update};
        if(update.password){
            if(!isStrongPassword(update.password)){
                throw new ConflictException('Password is not strong enough');
            }
            finalUpdate.password = await hash(update.password, 10)
        }
         return await this.userModel.findOneAndUpdate(query,finalUpdate,{new: true});
    }
    async addFriend(userId: string, friendId: string) {
        await this.userModel.findByIdAndUpdate(userId, {
            $addToSet: { friends: friendId }, // $addToSet prevents duplicates
        });
    }
    async deleteUser(email: string){
        const result=  await this.userModel.deleteOne({email});
        if( result.deletedCount === 0){
            throw new NotFoundException('User Not Found');
        }
        return {
            message: 'Delete Successfully'
        }
    }
    
    async updateLocation(userId: string, locationData: { latitude: number; longitude: number }) {
        return await this.userModel.findByIdAndUpdate(
            userId,
            {
                location: {
                    type: 'Point',
                    coordinates: [locationData.longitude, locationData.latitude]
                }
            },
            { new: true }
        );
    }
}
