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
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { Skill, SkillDocument } from './schemas/skill.schema';
import {
  deleteReplacedManagedUpload,
  normalizeMediaRef,
} from '../helpers/upload-cleanup';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
  ) {}

  async create(dto: CreateSkillDto): Promise<SkillDocument> {
    return this.skillModel.create({
      ...dto,
      icon: normalizeMediaRef(dto.icon),
      published: dto.published ?? true,
    });
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<SkillDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.skillModel
        .find(filter)
        .sort({ sortOrder: 1, category: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.skillModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findPublished(): Promise<SkillDocument[]> {
    return this.skillModel
      .find({ deleted: false, ...PUBLISHED_CATALOG_FILTER })
      .sort({ sortOrder: 1, category: 1 })
      .exec();
  }

  async findById(id: string): Promise<SkillDocument> {
    const item = await this.skillModel.findOne({ _id: id, deleted: false });
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async update(id: string, dto: UpdateSkillDto): Promise<SkillDocument> {
    const existing = await this.findById(id);

    if (dto.icon !== undefined) {
      dto.icon = normalizeMediaRef(dto.icon);
      await deleteReplacedManagedUpload(existing.icon, dto.icon);
    }

    const updated = await this.skillModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.skillModel.findByIdAndUpdate(id, { deleted: true });
  }

  async count(): Promise<number> {
    return this.skillModel.countDocuments({ deleted: false });
  }
}
