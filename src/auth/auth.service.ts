import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';
import { Response } from 'express';
import { hash } from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ){}

    async login(user: User, response: Response){
        if (!user || !user._id) {
            throw new UnauthorizedException('Invalid user data');
        }

        const expireAccessToken = new Date();
        expireAccessToken.setTime(expireAccessToken.getTime() + 
        parseInt(
            this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        ));

        const expireRefereshToken = new Date();
        expireRefereshToken.setTime(expireRefereshToken.getTime() + 
        parseInt(
            this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        ));
        const tokenPayload: TokenPayload = {
            userId: user._id.toString(),
            role: user.role // Use toString() instead of toHexString()
        };

        const accessToken = this.jwtService.sign(tokenPayload,
            {
                secret: this.configService.getOrThrow<string>('JWT_SECRET'),
                expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}ms`,
            }
        );
        const refreshToken = this.jwtService.sign(tokenPayload,
            {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: `${this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}ms`,
            }
        );
        await this.userService.updateUser(
            {_id: user._id},
            {$set:{refreshToken: await hash(refreshToken,10)}}
        );
        response.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            expires: expireAccessToken
        });
        response.cookie('Refresh', refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            expires: expireRefereshToken
        });
    }
    async verifyUserRefreshToken(refreshToken: string, userId: string){
        try {
           const user = await this.userService.getUser({_id: userId});
           if(!user.refreshToken){
            throw new UnauthorizedException('Invalid Credentials');
           }
           const authenticated = await compare(refreshToken, user.refreshToken);
           if(!authenticated){
            throw new UnauthorizedException('Invalid Credentials');
           }
           return user; 
        } catch (error) {
            throw new UnauthorizedException('refresh token not valild');
        }
    }
    
    async verifyUser(email: string, password: string): Promise<User> {
        try {
            const user = await this.userService.getUser({email});
            const authenticated = await compare(password, user.password);
            if(!authenticated){
                throw new UnauthorizedException('Invalid Credentials');
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid Credentials');
        }
    }
    async deleteUserByEmail(email: string){
        return this.userService.deleteUser(email);
    }
}
