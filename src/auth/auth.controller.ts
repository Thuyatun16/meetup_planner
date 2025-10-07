import { Controller, Post, Body, Get, UseGuards, Res, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { LoginDto, UserResponseDto } from './dto/auth.dto';
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
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService
        ,private readonly userService: UsersService
    ) { }
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'Login successful', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user =
        await this.authService.verifyUser(loginDto);
        console.log(user, 'this is user data');
        await this.authService.login(user, response);
    }
    @Post('refresh')
   
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
    @Get('me')
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'User info retrieved', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@CurrentUser() user: User) {
      return user;
    }
    @Post('logout')
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(@Res({ passthrough: true }) response: Response) {
      response.clearCookie('Authentication');
      response.clearCookie('Refresh');
      return { message: 'Logged out successfully' };
    }
}


