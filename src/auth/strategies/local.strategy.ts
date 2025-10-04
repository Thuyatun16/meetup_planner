import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/auth.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService){
        super({
            usernameField: 'email',
        });
    }
    async validate(LoginDto : LoginDto): Promise<any>{
        return this.authService.verifyUser(LoginDto);
    }
}
