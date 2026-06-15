import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;

  @IsString({ message: 'رمز عبور باید متن باشد' })
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  password: string;
}
