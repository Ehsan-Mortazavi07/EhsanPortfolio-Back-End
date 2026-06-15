import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorMessages } from '../constants/error-messages';
import { UserDocument } from '../../users/schemas/user.schema';
import { hasPanelAccess } from '../../users/user-role.util';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();
    const user = request.user;

    if (!user || !hasPanelAccess(user.role)) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    return true;
  }
}
