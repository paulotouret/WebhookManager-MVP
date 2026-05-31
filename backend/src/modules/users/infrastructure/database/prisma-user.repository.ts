import { prisma } from '../../../../infrastructure/database/prisma';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        tokenVersion: user.tokenVersion,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        mfaBackupCodes: user.mfaBackupCodes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || new Date(),
      },
    });
  }
  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        tokenVersion: user.tokenVersion,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        mfaBackupCodes: user.mfaBackupCodes,
        updatedAt: user.updatedAt || new Date(),
      },
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return User.create(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        tokenVersion: user.tokenVersion,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        mfaBackupCodes: user.mfaBackupCodes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      user.id,
    );
  }
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return User.create(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        tokenVersion: user.tokenVersion,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        mfaBackupCodes: user.mfaBackupCodes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      user.id,
    );
  }
}
