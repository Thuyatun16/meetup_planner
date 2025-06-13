import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';

@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @UseGuards(JwtAuthGuard)
    @Post('request')
    async addFriend(@CurrentUser() user, @Body() body: { email: string }) {
        return await this.friendService.addFriend(user.email, user._id, body.email);
    }

    @Post('respond')
    @UseGuards(JwtAuthGuard)
    async respondToFriendRequest(
        @CurrentUser() user,
        @Body('requesterId') requesterId: string,
        @Body('response') response: 'accept' | 'reject',
    ) {
        return await this.friendService.responseToFriendRequest(user._id, requesterId, response);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async unFriend(@CurrentUser() user, @Param('id') id: string) {
        return await this.friendService.unFriend(user._id, id);
    }

    @Get('friends')
    @UseGuards(JwtAuthGuard)
    async getFriends(@CurrentUser() user) {
        return this.friendService.getFriends(user._id);
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    async getPendingRequests(@CurrentUser() user) {
        return this.friendService.getPendingFriend(user._id);
    }

    @Get('sent')
    @UseGuards(JwtAuthGuard)
    async getSentRequests(@CurrentUser() user) {
        return this.friendService.getSentRequests(user._id);
    }

    @Delete('request/:recipientId')
    @UseGuards(JwtAuthGuard)
    async cancelFriendRequest(@CurrentUser() user, @Param('recipientId') recipientId: string) {
        return this.friendService.cancelFriendRequest(user._id, recipientId);
    }

    @Get('locations')
    @UseGuards(JwtAuthGuard)
    async getFriendsLocations(@CurrentUser() user) {
        return await this.friendService.getFriendsLocations(user._id);
    }
}