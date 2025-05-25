import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';
import { Response } from 'express';

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
        expireAccessToken.setMilliseconds(expireAccessToken.getTime() + 
        parseInt(
            this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        ));

        const tokenPayload: TokenPayload = {
            userId: user._id.toString(), // Use toString() instead of toHexString()
        };

        const accessToken = this.jwtService.sign(tokenPayload,
            {
                secret: this.configService.getOrThrow<string>('JWT_SECRET'),
                expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}ms`,
            }
        );

        response.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            expires: expireAccessToken
        });
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
}
