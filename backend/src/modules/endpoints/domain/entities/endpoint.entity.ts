import crypto from 'node:crypto';

export interface EndpointProps {
  name: string;
  description?: string | null;
  projectId: string;
  urlPath?: string | null;
  secret?: string | null;
  targetUrl?: string | null;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EndpointInternalProps {
  name: string;
  description: string | null;
  projectId: string;
  urlPath: string;
  secret: string;
  targetUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Endpoint {
  private readonly _id: string;
  private props: EndpointInternalProps;

  private constructor(props: EndpointProps, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = {
      name: props.name,
      description: props.description ?? null,
      projectId: props.projectId,
      urlPath: props.urlPath || crypto.randomBytes(8).toString('hex'),
      secret: props.secret || crypto.randomBytes(32).toString('hex'),
      targetUrl: props.targetUrl ?? null,
      active: props.active ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  static create(props: EndpointProps, id?: string): Endpoint {
    if (props.name.length < 3) {
      throw new Error('Endpoint name must be at least 3 characters long');
    }
    return new Endpoint(props, id);
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
  get projectId() {
    return this.props.projectId;
  }
  get urlPath() {
    return this.props.urlPath;
  }
  get secret() {
    return this.props.secret;
  }
  get targetUrl() {
    return this.props.targetUrl;
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
      description: this.description ?? undefined,
      projectId: this.projectId,
      urlPath: this.urlPath,
      secret: this.secret,
      targetUrl: this.targetUrl ?? undefined,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(props: Partial<Omit<EndpointProps, 'projectId' | 'urlPath' | 'secret' | 'createdAt'>>) {
    if (props.name !== undefined) this.props.name = props.name;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.targetUrl !== undefined) this.props.targetUrl = props.targetUrl;
    if (props.active !== undefined) this.props.active = props.active;
    if (props.updatedAt !== undefined) this.props.updatedAt = props.updatedAt;
    else this.props.updatedAt = new Date();
  }
}
