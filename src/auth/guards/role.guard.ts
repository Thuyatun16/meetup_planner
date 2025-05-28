import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RolesGuard implements CanActivate {
 constructor(private reflector: Reflector ){}
 canActivate(context: ExecutionContext): boolean {
  const allowRoles = this.reflector.getAllAndOverride('roles', [
   context.getHandler(),
   context.getClass(),
  ]);

    if(!allowRoles){
     return true;
    }
    const {user: User} =  context.switchToHttp().getRequest();
    return allowRoles.some((role: string) => User.role?.includes(role)); 
 }
}