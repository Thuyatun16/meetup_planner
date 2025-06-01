import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Friend } from './schema/friend-schema';
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FriendService {
    constructor(@InjectModel(Friend.name) private friendModel: Model<Friend>,
    private readonly userService: UsersService){}

    async addFriend(userId: string, friendEmail: string){
        const friend = await this.userService.getUser({email: friendEmail});
        if(!friend){
            throw new Error('Friend not found');
        }
        const existFriend = await this.friendModel.findOne({user: userId, friend: friend._id}).exec();
        if(existFriend){
            throw new Error('Friend already exists');
        }
        const newFriend = new this.friendModel({
            user: userId,
            friend: friend._id
        });
        await newFriend.save();
        await this.userService.addFriend(userId, friend._id.toString());
        return newFriend;
    }
    async getFriends(userId: string){
        const friends = await this.friendModel.find({user: userId}).populate('friend').exec();
        return friends.map(friend => friend.friend);
    }
}
