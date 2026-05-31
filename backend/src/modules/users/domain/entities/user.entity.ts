import crypto from 'node:crypto';

export interface UserProps {
  email: string;
  password: string;
  name?: string | null;
  tokenVersion?: number;
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  mfaBackupCodes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserInternalProps {
  email: string;
  password: string;
  name: string | null;
  tokenVersion: number;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaBackupCodes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _id: string;
  private props: UserInternalProps;

  private constructor(props: UserProps, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = {
      email: props.email,
      password: props.password,
      name: props.name ?? null,
      tokenVersion: props.tokenVersion ?? 1,
      mfaEnabled: props.mfaEnabled ?? false,
      mfaSecret: props.mfaSecret ?? null,
      mfaBackupCodes: props.mfaBackupCodes ?? null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  static create(props: UserProps, id?: string): User {
    if (!props.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (props.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return new User(props, id);
  }

  get id() {
    return this._id;
  }
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }
  get name() {
    return this.props.name;
  }
  get tokenVersion() {
    return this.props.tokenVersion;
  }
  get mfaEnabled() {
    return this.props.mfaEnabled;
  }
  get mfaSecret() {
    return this.props.mfaSecret;
  }
  get mfaBackupCodes() {
    return this.props.mfaBackupCodes;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  updateName(name: string) {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateEmail(email: string) {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  updatePassword(hashedPassword: string) {
    this.props.password = hashedPassword;
    this.props.updatedAt = new Date();
  }

  incrementTokenVersion() {
    this.props.tokenVersion = this.props.tokenVersion + 1;
    this.props.updatedAt = new Date();
  }

  updateMFASetup(secret: string, backupCodes: string[]) {
    this.props.mfaSecret = secret;
    this.props.mfaBackupCodes = JSON.stringify(backupCodes);
    this.props.updatedAt = new Date();
  }

  enableMFA() {
    this.props.mfaEnabled = true;
    this.props.updatedAt = new Date();
  }

  disableMFA() {
    this.props.mfaEnabled = false;
    this.props.mfaSecret = null;
    this.props.mfaBackupCodes = null;
    this.props.updatedAt = new Date();
  }
}
