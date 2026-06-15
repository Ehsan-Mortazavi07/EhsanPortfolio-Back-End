import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorMessages } from '../common/constants/error-messages';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { CreateContactMessageDto } from './dto/contact-message.dto';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessageDocument> {
    return this.contactMessageModel.create(dto);
  }

  async findAll(
    query: PaginationDto,
  ): Promise<PaginatedResponse<ContactMessageDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const [items, total] = await Promise.all([
      this.contactMessageModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.contactMessageModel.countDocuments(),
    ]);

    return { items, total, page, pageSize };
  }

  async findById(id: string): Promise<ContactMessageDocument> {
    const item = await this.contactMessageModel.findById(id);
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async markAsRead(id: string): Promise<ContactMessageDocument> {
    const updated = await this.contactMessageModel.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.contactMessageModel.findByIdAndDelete(id);
  }

  async count(): Promise<number> {
    return this.contactMessageModel.countDocuments();
  }

  async countUnread(): Promise<number> {
    return this.contactMessageModel.countDocuments({ read: false });
  }
}
