import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @UseGuards(JwtAuthGuard)
    @Post('request')
    @ApiOperation({ summary: 'Send a friend request' })
    @ApiBody({ 
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'friend@example.com' }
        }
      }
    })
    @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async addFriend(@CurrentUser() user, @Body() body: { email: string }) {
        return await this.friendService.addFriend(user.email, user._id, body.email);
    }

    @Post('respond')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Respond to a friend request' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          requesterId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          response: { type: 'string', enum: ['accept', 'reject'] }
        }
      }
    })
    @ApiResponse({ status: 200, description: 'Response processed successfully' })
    async respondToFriendRequest(
        @CurrentUser() user,
        @Body('requesterId') requesterId: string,
        @Body('response') response: 'accept' | 'reject',
    ) {
        return await this.friendService.responseToFriendRequest(user._id, requesterId, response);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Remove a friend' })
    @ApiParam({ name: 'id', description: 'Friend ID to remove' })
    @ApiResponse({ status: 200, description: 'Friend removed successfully' })
    async unFriend(@CurrentUser() user, @Param('id') id: string) {
        return await this.friendService.unFriend(user._id, id);
    }

    @Get('friends')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all friends' })
    @ApiResponse({ status: 200, description: 'List of all friends' })
    async getFriends(@CurrentUser() user) {
        return this.friendService.getFriends(user._id);
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get pending friend requests' })
    @ApiResponse({ status: 200, description: 'List of pending friend requests' })
    async getPendingRequests(@CurrentUser() user) {
        return this.friendService.getPendingFriend(user._id);
    }

    @Get('sent')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get sent friend requests' })
    @ApiResponse({ status: 200, description: 'List of sent friend requests' })
    async getSentRequests(@CurrentUser() user) {
        return this.friendService.getSentRequests(user._id);
    }

    @Delete('request/:recipientId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Cancel a sent friend request' })
    @ApiParam({ name: 'recipientId', description: 'ID of the request recipient' })
    @ApiResponse({ status: 200, description: 'Friend request cancelled successfully' })
    async cancelFriendRequest(@CurrentUser() user, @Param('recipientId') recipientId: string) {
        return this.friendService.cancelFriendRequest(user._id, recipientId);
    }

    @Get('locations')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get friends locations' })
    @ApiResponse({ status: 200, description: 'List of friends locations' })
    async getFriendsLocations(@CurrentUser() user) {
        return await this.friendService.getFriendsLocations(user._id);
    }
}
