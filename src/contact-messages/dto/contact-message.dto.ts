import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'نام الزامی است' })
  name: string;

  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @IsNotEmpty({ message: 'پیام الزامی است' })
  message: string;
}
