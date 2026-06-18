import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { ErrorMessages } from '../common/constants/error-messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';
import {
  assertRoleChangeAllowed,
  assertUserDeletionAllowed,
} from './user-role.util';

export function isUserApproved(user: Pick<UserDocument, 'status'>): boolean {
  return !user.status || user.status === UserStatus.APPROVED;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      deleted: false,
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      ...dto,
      password: hashedPassword,
      role: dto.role ?? UserRole.USER,
      status: dto.status ?? UserStatus.APPROVED,
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: data.email.toLowerCase(),
      deleted: false,
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userModel.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      role: UserRole.USER,
      status: UserStatus.PENDING,
    });
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    status?: UserStatus;
    q?: string;
  }): Promise<PaginatedResponse<UserDocument>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filter: Record<string, unknown> = { deleted: false };
    if (query.status) filter.status = query.status;

    const term = query.q?.trim();
    if (term) {
      const regex = new RegExp(
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: id, deleted: false });
    if (!user) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      email: email.toLowerCase(),
      deleted: false,
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), deleted: false })
      .select('+password');
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor?: UserDocument,
  ): Promise<UserDocument> {
    const user = await this.findById(id);

    if (dto.role !== undefined) {
      if (!actor) {
        throw new ForbiddenException(ErrorMessages.ROLE_CHANGE_FORBIDDEN);
      }
      try {
        assertRoleChangeAllowed(actor, user, dto);
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'SELF_ROLE_CHANGE_FORBIDDEN'
        ) {
          throw new ForbiddenException(
            ErrorMessages.SELF_ROLE_CHANGE_FORBIDDEN,
          );
        }
        throw new ForbiddenException(ErrorMessages.ROLE_CHANGE_FORBIDDEN);
      }
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        deleted: false,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(ErrorMessages.EMAIL_EXISTS);
      }
    }

    const updateData: Partial<User> = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string, actor?: UserDocument): Promise<void> {
    const user = await this.findById(id);

    if (actor) {
      try {
        assertUserDeletionAllowed(actor, user);
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'SELF_USER_DELETE_FORBIDDEN'
        ) {
          throw new ForbiddenException(
            ErrorMessages.SELF_USER_DELETE_FORBIDDEN,
          );
        }
        throw new ForbiddenException(ErrorMessages.USER_DELETE_FORBIDDEN);
      }
    }

    await this.userModel.findByIdAndUpdate(id, { deleted: true });
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments({ deleted: false });
  }
}
