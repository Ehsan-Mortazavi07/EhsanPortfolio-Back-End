import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorMessages } from '../common/constants/error-messages';
import { UserDocument, UserStatus } from '../users/schemas/user.schema';
import { isUserApproved, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    this.assertUserCanAuthenticate(user);

    const token = this.signToken(user);
    return { user: user.toJSON(), token };
  }

  async register(dto: RegisterDto) {
    await this.usersService.register(dto);
    return {
      message:
        'ثبت‌نام با موفقیت انجام شد. پس از تأیید ادمین می‌توانید وارد پنل شوید.',
    };
  }

  check(user: UserDocument) {
    this.assertUserCanAuthenticate(user);
    return { user: user.toJSON() };
  }

  private assertUserCanAuthenticate(user: UserDocument) {
    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException(ErrorMessages.ACCOUNT_PENDING);
    }
    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException(ErrorMessages.ACCOUNT_REJECTED);
    }
    if (!isUserApproved(user)) {
      throw new ForbiddenException(ErrorMessages.ACCOUNT_REJECTED);
    }
  }

  signToken(user: UserDocument): string {
    return this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }
}
