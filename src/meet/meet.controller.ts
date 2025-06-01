import { Controller, Get, Post, Req } from '@nestjs/common';
import { CreateMeetDto } from './dto/meet-create.dto';
import { Body } from '@nestjs/common';
import { MeetService } from './meet.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from 'src/auth/guards/jwt-refresh.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';


@Controller('meetups')
export class MeetController {
    constructor (private readonly meetService: MeetService){
    }
    @UseGuards(JwtAuthGuard,JwtRefreshAuthGuard)
    @Post()
    async createMeet(@Body() meet:{ title: string; location: string; time: Date; participants: string[] }){
        await this.meetService.createMeet(meet.title, meet.location, meet.time, meet.participants);
    }

    @UseGuards(JwtAuthGuard,JwtRefreshAuthGuard)
    @Get()
    async findAll(@Req() user){
        return await this.meetService.findAll(user.user._id);
    }
}
