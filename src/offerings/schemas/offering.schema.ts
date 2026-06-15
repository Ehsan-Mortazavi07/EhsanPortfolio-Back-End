import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferingDocument = HydratedDocument<Offering>;

@Schema({ timestamps: true })
export class Offering {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  titleFa: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionFa: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ default: false })
  highlighted: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  published: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const OfferingSchema = SchemaFactory.createForClass(Offering);
