import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorMessages } from '../common/constants/error-messages';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  catalogListFilter,
  PUBLISHED_CATALOG_FILTER,
} from '../common/helpers/catalog-filter';
import {
  deleteManagedUpload,
  deleteReplacedManagedUpload,
  isManagedUpload,
  normalizeMediaRef,
} from '../helpers/upload-cleanup';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private testimonialModel: Model<TestimonialDocument>,
  ) {}

  async create(dto: CreateTestimonialDto): Promise<TestimonialDocument> {
    return this.testimonialModel.create({
      ...dto,
      avatarUrl: normalizeMediaRef(dto.avatarUrl),
      published: dto.published ?? true,
    });
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<TestimonialDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.testimonialModel
        .find(filter)
        .sort({ sortOrder: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.testimonialModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findPublished(): Promise<TestimonialDocument[]> {
    return this.testimonialModel
      .find({ deleted: false, ...PUBLISHED_CATALOG_FILTER })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<TestimonialDocument> {
    const item = await this.testimonialModel.findOne({ _id: id, deleted: false });
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async update(
    id: string,
    dto: UpdateTestimonialDto,
  ): Promise<TestimonialDocument> {
    const existing = await this.findById(id);

    if (dto.avatarUrl !== undefined) {
      const nextAvatar = normalizeMediaRef(dto.avatarUrl);
      await deleteReplacedManagedUpload(existing.avatarUrl, nextAvatar);
      dto.avatarUrl = nextAvatar;
    }

    const updated = await this.testimonialModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.testimonialModel.findByIdAndUpdate(id, { deleted: true });
    if (isManagedUpload(item.avatarUrl)) {
      await deleteManagedUpload(item.avatarUrl);
    }
  }

  async count(): Promise<number> {
    return this.testimonialModel.countDocuments({ deleted: false });
  }
}
