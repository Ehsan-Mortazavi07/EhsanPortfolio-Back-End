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
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

function collectProjectUploads(project: ProjectDocument): string[] {
  return [
    project.coverImage,
    ...(project.gallery ?? []),
    ...extractManagedUploadsFromHtml(project.contentHtml),
    ...extractManagedUploadsFromHtml(project.contentHtmlFa),
  ].filter(isManagedUpload);
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectDocument> {
    const existing = await this.projectModel.findOne({
      slug: dto.slug,
      deleted: false,
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.SLUG_EXISTS);
    }
    return this.projectModel.create({
      ...dto,
      coverImage: normalizeMediaRef(dto.coverImage),
      published: dto.published ?? true,
    });
  }

  async findAll(
    query: PaginationDto,
    publishedOnly = false,
  ): Promise<PaginatedResponse<ProjectDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter = catalogListFilter(publishedOnly);

    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findFeatured(limit = 6): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ deleted: false, ...PUBLISHED_CATALOG_FILTER, featured: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ _id: id, deleted: false });
    if (!project) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND);
    }
    return project;
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<ProjectDocument> {
    const filter: Record<string, unknown> = { slug, deleted: false };
    if (publishedOnly) Object.assign(filter, PUBLISHED_CATALOG_FILTER);
    const project = await this.projectModel.findOne(filter);
    if (!project) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const existing = await this.findById(id);

    if (dto.slug) {
      const slugTaken = await this.projectModel.findOne({
        slug: dto.slug,
        deleted: false,
        _id: { $ne: id },
      });
      if (slugTaken) {
        throw new ConflictException(ErrorMessages.SLUG_EXISTS);
      }
    }

    if (dto.coverImage !== undefined) {
      const nextCover = normalizeMediaRef(dto.coverImage);
      await deleteReplacedManagedUpload(existing.coverImage, nextCover);
      dto.coverImage = nextCover;
    }

    if (dto.contentHtml !== undefined) {
      await deleteHtmlUploadDiff(existing.contentHtml, dto.contentHtml);
    }

    if (dto.contentHtmlFa !== undefined) {
      await deleteHtmlUploadDiff(existing.contentHtmlFa, dto.contentHtmlFa);
    }

    if (dto.gallery !== undefined) {
      const oldGallery = new Set(
        (existing.gallery ?? []).filter((path) => isManagedUpload(path)),
      );
      const newGallery = new Set(
        dto.gallery.filter((path) => isManagedUpload(path)),
      );
      const removed = [...oldGallery].filter((path) => !newGallery.has(path));
      await deleteManagedUploads(removed);
    }

    const updated = await this.projectModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const project = await this.findById(id);
    await this.projectModel.findByIdAndUpdate(id, { deleted: true });
    await deleteManagedUploads(collectProjectUploads(project));
  }

  async count(publishedOnly = false): Promise<number> {
    return this.projectModel.countDocuments(catalogListFilter(publishedOnly));
  }
}
