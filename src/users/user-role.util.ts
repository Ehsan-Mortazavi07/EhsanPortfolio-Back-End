import { UserRole, UserStatus } from './schemas/user.schema';
import { UpdateUserDto } from './dto/user.dto';
import type { UserDocument } from './schemas/user.schema';

const PANEL_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.CREATOR]);

export function hasPanelAccess(role?: UserRole | null): boolean {
  return Boolean(role && PANEL_ROLES.has(role));
}

export function canManageRoles(role?: UserRole | null): boolean {
  return role === UserRole.CREATOR;
}

export function canDeleteUsers(role?: UserRole | null): boolean {
  return role === UserRole.CREATOR;
}

export function assertUserDeletionAllowed(
  actor: UserDocument,
  target: UserDocument,
): void {
  if (!canDeleteUsers(actor.role)) {
    throw new Error('USER_DELETE_FORBIDDEN');
  }
  if (actor._id.toString() === target._id.toString()) {
    throw new Error('SELF_USER_DELETE_FORBIDDEN');
  }
}

export function assertRoleChangeAllowed(
  actor: UserDocument,
  target: UserDocument,
  dto: UpdateUserDto,
): void {
  if (dto.role === undefined) return;

  if (canManageRoles(actor.role)) {
    if (actor._id.toString() === target._id.toString() && dto.role !== UserRole.CREATOR) {
      throw new Error('SELF_ROLE_CHANGE_FORBIDDEN');
    }
    return;
  }

  const isApproveAsAdmin =
    dto.role === UserRole.ADMIN &&
    dto.status === UserStatus.APPROVED &&
    (target.status === UserStatus.PENDING || target.status === UserStatus.REJECTED);

  const isRejectAsUser =
    dto.role === UserRole.USER && dto.status === UserStatus.REJECTED;

  if (!isApproveAsAdmin && !isRejectAsUser) {
    throw new Error('ROLE_CHANGE_FORBIDDEN');
  }
}
