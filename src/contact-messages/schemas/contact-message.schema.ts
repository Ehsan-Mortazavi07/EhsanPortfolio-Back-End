import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
