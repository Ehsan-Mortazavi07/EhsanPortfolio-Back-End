import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SiteSettingsDocument = HydratedDocument<SiteSettings>;

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ default: '' })
  github: string;

  @Prop({ default: '' })
  linkedin: string;

  @Prop({ default: '' })
  twitter: string;

  @Prop({ default: '' })
  telegram: string;

  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  youtube: string;
}

@Schema({ _id: false })
export class SeoDefaults {
  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  keywords: string;

  @Prop({ default: '' })
  ogImage: string;
}

@Schema({ _id: false })
export class PageSubtitle {
  @Prop({ default: '' })
  subtitle: string;

  @Prop({ default: '' })
  subtitleFa: string;
}

@Schema({ _id: false })
export class PageSubtitles {
  @Prop({ type: PageSubtitle, default: () => ({}) })
  services: PageSubtitle;

  @Prop({ type: PageSubtitle, default: () => ({}) })
  experience: PageSubtitle;

  @Prop({ type: PageSubtitle, default: () => ({}) })
  projects: PageSubtitle;

  @Prop({ type: PageSubtitle, default: () => ({}) })
  testimonials: PageSubtitle;
}

@Schema({ timestamps: true })
export class SiteSettings {
  @Prop({ default: '' })
  heroTitle: string;

  @Prop({ default: '' })
  heroTitleFa: string;

  @Prop({ default: '' })
  heroSubtitle: string;

  @Prop({ default: '' })
  heroSubtitleFa: string;

  @Prop({ default: '' })
  heroBio: string;

  @Prop({ default: '' })
  heroBioFa: string;

  @Prop({ default: '' })
  heroImage: string;

  @Prop({ default: '' })
  cvUrl: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  location: string;

  @Prop({ type: SocialLinks, default: () => ({}) })
  socialLinks: SocialLinks;

  @Prop({ type: [String], default: [] })
  tickerSkills: string[];

  @Prop({ default: '' })
  aboutContent: string;

  @Prop({ default: '' })
  aboutContentFa: string;

  @Prop({ type: SeoDefaults, default: () => ({}) })
  seo: SeoDefaults;

  @Prop({ type: PageSubtitles, default: () => ({}) })
  pageSubtitles: PageSubtitles;
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings);
