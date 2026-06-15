import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExperienceDocument = HydratedDocument<Experience>;

@Schema({ timestamps: true })
export class Experience {
  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ default: '', trim: true })
  companyFa: string;

  @Prop({ required: true, trim: true })
  role: string;

  @Prop({ default: '', trim: true })
  roleFa: string;

  @Prop({ default: '', trim: true })
  duration: string;

  @Prop({ default: '', trim: true })
  durationFa: string;

  @Prop({ default: '', trim: true })
  years: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionFa: string;

  @Prop({ default: false })
  highlighted: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  published: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);
