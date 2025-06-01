import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';

@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService){}
    @UseGuards(JwtAuthGuard)
    @Post()
    async addFriend(@CurrentUser() user,@Body() body: {email: string}){
        return await this.friendService.addFriend(user._id,body.email);
    }
    @Get()
    @UseGuards(JwtAuthGuard)
    async getFriends(@CurrentUser() user){
        return this.friendService.getFriends(user._id);
    }
}
