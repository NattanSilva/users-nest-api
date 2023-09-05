import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserOwnerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    console.log(request?.user.id !== request.params.id);

    if (request?.user.id !== request.params.id) {
      throw new UnauthorizedException('you dont have owner permission!');
    }

    return true;
  }
}
