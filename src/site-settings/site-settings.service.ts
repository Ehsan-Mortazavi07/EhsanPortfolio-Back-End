import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorMessages } from '../common/constants/error-messages';
import {
  deleteHtmlUploadDiff,
  deleteReplacedManagedUpload,
  normalizeMediaRef,
} from '../helpers/upload-cleanup';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';
import {
  SiteSettings,
  SiteSettingsDocument,
} from './schemas/site-settings.schema';

function mergeSocialField(
  incoming: string | null | undefined,
  current: string | undefined,
): string {
  if (incoming === undefined) return current ?? '';
  return normalizeMediaRef(incoming);
}

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectModel(SiteSettings.name)
    private settingsModel: Model<SiteSettingsDocument>,
  ) {}

  async get(): Promise<SiteSettingsDocument> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsDocument> {
    const settings = await this.get();
    const payload: Record<string, unknown> = { ...dto };

    if (dto.heroPortraitUrl !== undefined) {
      const nextHero = normalizeMediaRef(dto.heroPortraitUrl);
      await deleteReplacedManagedUpload(settings.heroImage, nextHero);
      payload.heroImage = nextHero;
      delete payload.heroPortraitUrl;
    }

    if (dto.cvUrl !== undefined) {
      const nextCv = normalizeMediaRef(dto.cvUrl);
      await deleteReplacedManagedUpload(settings.cvUrl, nextCv);
      payload.cvUrl = nextCv;
    }

    if (dto.aboutContent !== undefined) {
      await deleteHtmlUploadDiff(settings.aboutContent, dto.aboutContent ?? '');
      payload.aboutContent = dto.aboutContent ?? '';
    }

    if (dto.aboutContentFa !== undefined) {
      await deleteHtmlUploadDiff(
        settings.aboutContentFa,
        dto.aboutContentFa ?? '',
      );
      payload.aboutContentFa = dto.aboutContentFa ?? '';
    }

    if (dto.location !== undefined) {
      payload.location = normalizeMediaRef(dto.location);
    }

    if (
      dto.githubUrl !== undefined ||
      dto.linkedinUrl !== undefined ||
      dto.twitterUrl !== undefined ||
      dto.telegramUrl !== undefined ||
      dto.instagramUrl !== undefined
    ) {
      payload.socialLinks = {
        github: mergeSocialField(dto.githubUrl, settings.socialLinks?.github),
        linkedin: mergeSocialField(
          dto.linkedinUrl,
          settings.socialLinks?.linkedin,
        ),
        twitter: mergeSocialField(
          dto.twitterUrl,
          settings.socialLinks?.twitter,
        ),
        telegram: mergeSocialField(
          dto.telegramUrl,
          settings.socialLinks?.telegram,
        ),
        instagram: mergeSocialField(
          dto.instagramUrl,
          settings.socialLinks?.instagram,
        ),
        youtube: settings.socialLinks?.youtube ?? '',
      };
      delete payload.githubUrl;
      delete payload.linkedinUrl;
      delete payload.twitterUrl;
      delete payload.telegramUrl;
      delete payload.instagramUrl;
    }

    if (dto.pageSubtitles !== undefined) {
      const current = settings.pageSubtitles ?? {};
      payload.pageSubtitles = {
        services: {
          ...(current.services ?? {}),
          ...(dto.pageSubtitles.services ?? {}),
        },
        experience: {
          ...(current.experience ?? {}),
          ...(dto.pageSubtitles.experience ?? {}),
        },
        projects: {
          ...(current.projects ?? {}),
          ...(dto.pageSubtitles.projects ?? {}),
        },
        testimonials: {
          ...(current.testimonials ?? {}),
          ...(dto.pageSubtitles.testimonials ?? {}),
        },
      };
    }

    Object.assign(settings, payload);
    return settings.save();
  }

  async getOrThrow(): Promise<SiteSettingsDocument> {
    const settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      throw new NotFoundException(ErrorMessages.SETTINGS_NOT_FOUND);
    }
    return settings;
  }
}
