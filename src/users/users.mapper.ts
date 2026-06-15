import { UserDocument, UserStatus } from './schemas/user.schema';

export function mapUser(user: UserDocument) {
  const doc = user as UserDocument & { createdAt?: Date; updatedAt?: Date };

  return {
    id: user._id?.toString() ?? '',
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status ?? UserStatus.APPROVED,
    createdAt: doc.createdAt?.toISOString?.() ?? null,
    updatedAt: doc.updatedAt?.toISOString?.() ?? null,
  };
}
