import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  titleFa: string;

  @Prop({ default: '', trim: true })
  category: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionFa: string;

  @Prop({ default: '' })
  contentHtml: string;

  @Prop({ default: '' })
  contentHtmlFa: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ type: [String], default: [] })
  gallery: string[];

  @Prop({ type: [String], default: [] })
  techStack: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  published: boolean;

  @Prop({ default: '' })
  caseStudyUrl: string;

  @Prop({ default: '' })
  githubUrl: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
