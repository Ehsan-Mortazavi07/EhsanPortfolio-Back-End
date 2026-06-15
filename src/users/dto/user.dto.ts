import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;

  @IsString({ message: 'رمز عبور باید متن باشد' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;

  @IsString({ message: 'نام باید متن باشد' })
  @IsNotEmpty({ message: 'نام الزامی است' })
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'نقش کاربر نامعتبر است' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'وضعیت کاربر نامعتبر است' })
  status?: UserStatus;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'رمز عبور باید متن باشد' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'نام باید متن باشد' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'نقش کاربر نامعتبر است' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'وضعیت کاربر نامعتبر است' })
  status?: UserStatus;
}
