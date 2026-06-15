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
  catalogListFilter,
  PUBLISHED_CATALOG_FILTER,
} from '../common/helpers/catalog-filter';
import {
  deleteHtmlUploadDiff,
  deleteManagedUploads,
  deleteReplacedManagedUpload,
  extractManagedUploadsFromHtml,
  isManagedUpload,
  normalizeMediaRef,
} from '../helpers/upload-cleanup';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { Article, ArticleDocument } from './schemas/article.schema';

function collectArticleUploads(article: ArticleDocument): string[] {
  return [
    article.coverImage,
    ...extractManagedUploadsFromHtml(article.contentHtml),
    ...extractManagedUploadsFromHtml(article.contentHtmlFa),
  ].filter(isManagedUpload);
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async create(dto: CreateArticleDto): Promise<ArticleDocument> {
    const existing = await this.articleModel.findOne({
      slug: dto.slug,
      deleted: false,
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.SLUG_EXISTS);
    }

    const data = {
      ...dto,
      coverImage: normalizeMediaRef(dto.coverImage),
      published: dto.published ?? true,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
    };
    return this.articleModel.create(data);
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<ArticleDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.articleModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findById(id: string): Promise<ArticleDocument> {
    const item = await this.articleModel.findOne({ _id: id, deleted: false });
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<ArticleDocument> {
    const filter: Record<string, unknown> = { slug, deleted: false };
    if (publishedOnly) Object.assign(filter, PUBLISHED_CATALOG_FILTER);
    const item = await this.articleModel.findOne(filter);
    if (!item) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return item;
  }

  async update(id: string, dto: UpdateArticleDto): Promise<ArticleDocument> {
    const existing = await this.findById(id);

    if (dto.slug) {
      const slugTaken = await this.articleModel.findOne({
        slug: dto.slug,
        deleted: false,
        _id: { $ne: id },
      });
      if (slugTaken) throw new ConflictException(ErrorMessages.SLUG_EXISTS);
    }

    const updateData: Record<string, unknown> = { ...dto };

    if (dto.coverImage !== undefined) {
      const nextCover = normalizeMediaRef(dto.coverImage);
      await deleteReplacedManagedUpload(existing.coverImage, nextCover);
      updateData.coverImage = nextCover;
    }

    if (dto.contentHtml !== undefined) {
      await deleteHtmlUploadDiff(existing.contentHtml, dto.contentHtml);
    }

    if (dto.contentHtmlFa !== undefined) {
      await deleteHtmlUploadDiff(existing.contentHtmlFa, dto.contentHtmlFa);
    }

    if (dto.publishedAt) {
      updateData.publishedAt = new Date(dto.publishedAt);
    }

    const updated = await this.articleModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) throw new NotFoundException(ErrorMessages.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const article = await this.findById(id);
    await this.articleModel.findByIdAndUpdate(id, { deleted: true });
    await deleteManagedUploads(collectArticleUploads(article));
  }

  async count(): Promise<number> {
    return this.articleModel.countDocuments({ deleted: false });
  }
}
