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
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { Experience, ExperienceDocument } from './schemas/experience.schema';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectModel(Experience.name)
    private experienceModel: Model<ExperienceDocument>,
  ) {}

  async create(dto: CreateExperienceDto): Promise<ExperienceDocument> {
    return this.experienceModel.create({
      ...dto,
      published: dto.published ?? true,
    });
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<ExperienceDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.experienceModel
        .find(filter)
        .sort({ sortOrder: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.experienceModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findPublished(): Promise<ExperienceDocument[]> {
    return this.experienceModel
      .find({ deleted: false, ...PUBLISHED_CATALOG_FILTER })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<ExperienceDocument> {
    const item = await this.experienceModel.findOne({
      _id: id,
      deleted: false,
    });
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async update(
    id: string,
    dto: UpdateExperienceDto,
  ): Promise<ExperienceDocument> {
    await this.findById(id);
    const updated = await this.experienceModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.experienceModel.findByIdAndUpdate(id, { deleted: true });
  }

  async count(): Promise<number> {
    return this.experienceModel.countDocuments({ deleted: false });
  }
}
