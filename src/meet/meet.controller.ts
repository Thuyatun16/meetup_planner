import { Controller, Delete, ForbiddenException, Get, Param, Post, Put } from '@nestjs/common';
import { CreateMeetDto, UpdateMeetDto } from './dto/meet-create.dto';
import { Body } from '@nestjs/common';
import { MeetService } from './meet.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';


@Controller('meetups')
export class MeetController {
    constructor (private readonly meetService: MeetService){
    }
    @UseGuards(JwtAuthGuard)
    @Post()
    async createMeet(@Body() meet:CreateMeetDto,@CurrentUser() user: any){
   
       const response = await this.meetService.createMeet(
            meet.title,
            meet.location, 
            meet.time, 
            meet.participants,
            user._id);
            console.log(response,"this is response");
            return response;
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateMeet(@Param('id')id: string,@Body() meet:UpdateMeetDto,@CurrentUser() user:any){
        // const meetup = await this.meetService.findOne(id);
        // if(!meetup || meetup.creator.toString() !==user._id){
        //     throw new ForbiddenException('You are not authorized to update this meetup');
        // }
        return this.meetService.update(id,meet);
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id')id: string){
         const meetup = await this.meetService.findOne(id);
        return meetup;
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteMeet(@Param('id')id: string,@CurrentUser() user:any){
        // const meetup = await this.meetService.findOne(id);
        // if(!meetup || meetup.creator.toString()!==user._id){
        //     throw new ForbiddenException('You are not authorized to delete this meetup');
        // }
        return this.meetService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@CurrentUser() user: any){
        return await this.meetService.findAll(user._id);
    }
}
