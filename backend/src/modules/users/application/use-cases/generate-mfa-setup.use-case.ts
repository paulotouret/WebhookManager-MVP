import { randomBytes } from 'node:crypto';
import { AppError } from '../../../../shared/errors/app-error';
import * as OTPAuth from 'otpauth';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

interface GenerateMFASetupResult {
  secret: string;
  otpauthUrl: string;
}

export class GenerateMFASetupUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<GenerateMFASetupResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA is already enabled for this user');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'HookFlow',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;
    const otpauthUrl = totp.toString();

    const backupCodes = Array.from({ length: 10 }, () => randomBytes(5).toString('hex').toUpperCase());

    user.updateMFASetup(secret, backupCodes);
    await this.userRepository.update(user);

    return {
      secret,
      otpauthUrl,
    };
  }
}
