import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class SocialLinksDto {
  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  youtube?: string;
}

class SeoDefaultsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;
}

class PageSubtitleDto {
  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  subtitleFa?: string;
}

class PageSubtitlesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSubtitleDto)
  services?: PageSubtitleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageSubtitleDto)
  experience?: PageSubtitleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageSubtitleDto)
  projects?: PageSubtitleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageSubtitleDto)
  testimonials?: PageSubtitleDto;
}

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroTitleFa?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitleFa?: string;

  @IsOptional()
  @IsString()
  heroBio?: string;

  @IsOptional()
  @IsString()
  heroBioFa?: string;

  @IsOptional()
  @IsString()
  heroImage?: string;

  @IsOptional()
  @IsString()
  heroPortraitUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsString()
  telegramUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tickerSkills?: string[];

  @IsOptional()
  @IsString()
  aboutContent?: string;

  @IsOptional()
  @IsString()
  aboutContentFa?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDefaultsDto)
  seo?: SeoDefaultsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageSubtitlesDto)
  pageSubtitles?: PageSubtitlesDto;
}
