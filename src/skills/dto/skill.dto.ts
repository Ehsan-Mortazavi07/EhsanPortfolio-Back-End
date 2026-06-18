import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SkillCategory } from '../schemas/skill.schema';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'نام مهارت الزامی است' })
  name: string;

  @IsEnum(SkillCategory, { message: 'دسته‌بندی مهارت نامعتبر است' })
  category: SkillCategory;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  level?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  level?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
