import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserStatus } from '../schemas/user.schema';

export class UsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'وضعیت کاربر نامعتبر است' })
  status?: UserStatus;
}
