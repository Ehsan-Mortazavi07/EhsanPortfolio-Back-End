import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  titleFa: string;

  @Prop({ default: '' })
  excerpt: string;

  @Prop({ default: '' })
  excerptFa: string;

  @Prop({ default: '' })
  contentHtml: string;

  @Prop({ default: '' })
  contentHtmlFa: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ default: true })
  published: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ default: false })
  deleted: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
