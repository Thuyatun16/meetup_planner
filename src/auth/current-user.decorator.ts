import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUserByContext = (context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;
}
export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => {
        return CurrentUserByContext(context);
    }
); 