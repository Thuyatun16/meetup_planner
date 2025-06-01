import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/users/schema/user.schema';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.auth.guard';
import { RolesGuard } from './guards/role.guard';
import { Role } from './role-decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService
        ,private readonly userService: UsersService
    ) { }
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.login(user, response);
    }
    @Post('refresh')
    @UseGuards(JwtRefreshAuthGuard)
    async refresh(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ){
        await this.authService.login(user, response);
    }
    @Delete()
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Role('admin')
    async deleteUser(@Body('email')email: string){
        await this.authService.deleteUserByEmail(email);
    }
    @Put('me')
    @UseGuards(JwtAuthGuard)
    async updateUser(@CurrentUser() user:User,@Body() updateData: Partial<User>): Promise<User|null>{
        return await this.userService.updateUser({_id: user._id},updateData);
    }
    // Add this to your existing auth.controller.ts
    
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User) {
      return user;
    }
    
    // You might also want to add a logout endpoint
    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
      response.clearCookie('Authentication');
      response.clearCookie('Refresh');
      return { message: 'Logged out successfully' };
    }
}


