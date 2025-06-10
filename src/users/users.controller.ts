import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './schema/user.schema';
import { JwtRefreshAuthGuard } from 'src/auth/guards/jwt-refresh.auth.guard';


@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}
    @Post('signup')
    async createUser(@Body() user: CreateUserRequest ) {
        await this.userService.createUser(user);
    }
    @Get()
    @UseGuards(JwtAuthGuard,JwtRefreshAuthGuard)
    async getUser(@CurrentUser()user: User){
        console.log(user);
        return await this.userService.getUsers();
    }
    @Get('me')
    async me(user: User){
        return this.userService.getUsers();
    }
}
