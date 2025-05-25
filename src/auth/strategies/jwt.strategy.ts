import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { TokenPayload } from "../token-payload.interface";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(configService: ConfigService,
        private readonly userService: UsersService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request)=>request.cookies?.Authentication,
            ]),
            secretOrKey: configService.getOrThrow('JWT_SECRET'),
        });
    }
    async validate(payload: TokenPayload){
        return this.userService.getUser({_id: payload.userId});
    }
}