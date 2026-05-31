import crypto from 'node:crypto';

export interface ProjectProps {
  name: string;
  description?: string | null;
  userId: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectInternalProps {
  name: string;
  description: string | null;
  userId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private readonly _id: string;
  private props: ProjectInternalProps;

  private constructor(props: ProjectProps, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = {
      name: props.name,
      description: props.description ?? null,
      userId: props.userId,
      active: props.active ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  static create(props: ProjectProps, id?: string): Project {
    if (props.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }
    return new Project(props, id);
  }

  get id() {
    return this._id;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get userId() {
    return this.props.userId;
  }
  get active() {
    return this.props.active;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(props: Partial<Omit<ProjectProps, 'userId' | 'createdAt'>>) {
    if (props.name !== undefined) this.props.name = props.name;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.active !== undefined) this.props.active = props.active;
    if (props.updatedAt !== undefined) this.props.updatedAt = props.updatedAt;
    else this.props.updatedAt = new Date();
  }
}
