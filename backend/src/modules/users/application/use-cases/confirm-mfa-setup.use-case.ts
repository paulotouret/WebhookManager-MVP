import { AppError } from '../../../../shared/errors/app-error';
import * as OTPAuth from 'otpauth';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

export class ConfirmMFASetupUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.mfaSecret) {
      throw new AppError('MFA setup not initiated. Please generate MFA setup first.');
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA is already enabled');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'HookFlow',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.mfaSecret,
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      throw new AppError('Invalid authentication code', 400);
    }

    user.enableMFA();
    await this.userRepository.update(user);

    const backupCodes = user.mfaBackupCodes ? (JSON.parse(user.mfaBackupCodes) as string[]) : [];
    return { backupCodes };
  }
}
