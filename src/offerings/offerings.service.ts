import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorMessages } from '../common/constants/error-messages';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  deleteManagedUpload,
  deleteReplacedManagedUpload,
  isManagedUpload,
  normalizeMediaRef,
} from '../helpers/upload-cleanup';
import {
  catalogListFilter,
  PUBLISHED_CATALOG_FILTER,
} from '../common/helpers/catalog-filter';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';
import { Offering, OfferingDocument } from './schemas/offering.schema';

@Injectable()
export class OfferingsService {
  constructor(
    @InjectModel(Offering.name) private offeringModel: Model<OfferingDocument>,
  ) {}

  async create(dto: CreateOfferingDto): Promise<OfferingDocument> {
    const existing = await this.offeringModel.findOne({
      slug: dto.slug,
      deleted: false,
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.SLUG_EXISTS);
    }
    return this.offeringModel.create({
      ...dto,
      icon: normalizeMediaRef(dto.icon),
      published: dto.published ?? true,
    });
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<OfferingDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.offeringModel
        .find(filter)
        .sort({ sortOrder: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.offeringModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findPublished(): Promise<OfferingDocument[]> {
    return this.offeringModel
      .find({ deleted: false, ...PUBLISHED_CATALOG_FILTER })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findById(id: string): Promise<OfferingDocument> {
    const item = await this.offeringModel.findOne({ _id: id, deleted: false });
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async findBySlug(
    slug: string,
    publishedOnly = false,
  ): Promise<OfferingDocument> {
    const filter: Record<string, unknown> = { slug, deleted: false };
    if (publishedOnly) Object.assign(filter, PUBLISHED_CATALOG_FILTER);
    const item = await this.offeringModel.findOne(filter);
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async update(id: string, dto: UpdateOfferingDto): Promise<OfferingDocument> {
    const existing = await this.findById(id);
    if (dto.slug) {
      const slugTaken = await this.offeringModel.findOne({
        slug: dto.slug,
        deleted: false,
        _id: { $ne: id },
      });
      if (slugTaken) throw new ConflictException(ErrorMessages.SLUG_EXISTS);
    }

    if (dto.icon !== undefined) {
      const nextIcon = normalizeMediaRef(dto.icon);
      if (isManagedUpload(existing.icon)) {
        await deleteReplacedManagedUpload(
          existing.icon,
          isManagedUpload(nextIcon) ? nextIcon : '',
        );
      }
      dto.icon = nextIcon;
    }

    const updated = await this.offeringModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.offeringModel.findByIdAndUpdate(id, { deleted: true });
    if (isManagedUpload(item.icon)) {
      await deleteManagedUpload(item.icon);
    }
  }

  async count(): Promise<number> {
    return this.offeringModel.countDocuments({ deleted: false });
  }
}
