import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Friend, FriendStatus } from './schema/friend-schema';
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class FriendService {
    constructor(
        @InjectModel(Friend.name) private friendModel: Model<Friend>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly userService: UsersService
    ) {}

    async addFriend(email: string, userId: string, friendEmail: string) {
        const friend = await this.userService.getUser({ email: friendEmail });
        if (email === friendEmail) {
            throw new BadRequestException('You cannot add yourself as a friend');
        }
        if (!friend) {
            throw new NotFoundException('Friend not found');
        }
        const existFriend = await this.friendModel.findOne({ user: userId, friend: friend._id }).exec();
        if (existFriend) {
            throw new BadRequestException('Friend request already sent');
        }
        return await this.friendModel.create({
            user: userId,
            friend: friend._id,
            status: FriendStatus.PENDING,
        });
    }

    async responseToFriendRequest(userId: string, requesterId: string, response: 'accept' | 'reject') {
        const friendRequest = await this.friendModel.findOne({
            user: requesterId,
            friend: userId,
            status: FriendStatus.PENDING,
        }).exec();
        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }
        if (response === 'accept') {
            friendRequest.status = FriendStatus.ACCEPTED;
            await friendRequest.save();
            await this.friendModel.create({
              user: userId,
              friend: requesterId,
              status: FriendStatus.ACCEPTED,
            });
            await this.userService.addFriend(userId, requesterId);
            await this.userService.addFriend(requesterId, userId);
        } else {
            friendRequest.status = FriendStatus.REJECTED;
            await friendRequest.save();
        }
        return friendRequest;
    }

    async unFriend(userId: string, friendId: string) {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) {
                throw new Error('Invalid user or friend id');
            }
            const userObjectId = new Types.ObjectId(userId);
            const friendObjectId = new Types.ObjectId(friendId);

            await this.userModel.findByIdAndUpdate(userObjectId, {
                $pull: { friends: friendObjectId },
            });

            await this.userModel.findByIdAndUpdate(friendObjectId, {
                $pull: { friends: userObjectId },
            });

            await this.friendModel.findOneAndDelete({
                user: userObjectId,
                friend: friendObjectId,
                status: FriendStatus.ACCEPTED,
            });

            return { message: 'Friend removed successfully' };
        } catch (error) {
            throw error;
        }
    }

    async getFriends(userId: string) {
        const friends = await this.friendModel
            .find({
                user: userId,
                status: FriendStatus.ACCEPTED,
            })
            .populate('friend')
            .exec();
        return friends.map(friend => friend.friend);
    }

    async getPendingFriend(userId: string) {
        const requests = await this.friendModel
            .find({
                friend: userId,
                status: FriendStatus.PENDING,
            })
            .populate('user')
            .exec();
        return requests.map(request => request.user);
    }

    async getSentRequests(userId: string) {
        const sentRequests = await this.friendModel
            .find({
                user: userId,
                status: FriendStatus.PENDING,
            })
            .populate('friend')
            .exec();
        return sentRequests.map(request => request.friend);
    }

    async cancelFriendRequest(userId: string, recipientId: string) {
        const request = await this.friendModel.findOneAndDelete({
            user: userId,
            friend: recipientId,
            status: FriendStatus.PENDING,
        });
        if (!request) {
            throw new NotFoundException('Friend request not found');
        }
        return { message: 'Friend request canceled' };
    }

    async getFriendsLocations(userId: string) {
      const user = await this.userModel.findById(userId).populate('friends').exec();
  
      if (!user) {
          throw new NotFoundException('User not found');
      }
  
      return (user.friends as unknown as User[]).map(friend => ({
          _id: friend._id,
          name: friend.name,
          email: friend.email,
          location: friend.location
      }));
  }
}