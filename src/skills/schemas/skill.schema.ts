import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SkillDocument = HydratedDocument<Skill>;

export enum SkillCategory {
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  DEVOPS = 'devops',
  DATABASE = 'database',
}

@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ enum: SkillCategory, required: true })
  category: SkillCategory;

  @Prop({ min: 1, max: 5, default: 3 })
  level: number;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  published: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
