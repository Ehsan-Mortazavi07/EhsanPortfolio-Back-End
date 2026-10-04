import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  nameFa: string;

  @Prop({ default: '', trim: true })
  role: string;

  @Prop({ default: '', trim: true })
  roleFa: string;

  @Prop({ default: '', trim: true })
  company: string;

  @Prop({ default: '', trim: true })
  companyFa: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: '' })
  contentFa: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ min: 1, max: 5, default: 5 })
  rating: number;

  @Prop({ default: false })
  published: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  deleted: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
