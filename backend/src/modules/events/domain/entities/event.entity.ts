import crypto from 'node:crypto';

export interface EventProps {
  method: string;
  headers: any;
  body: any;
  query: any;
  status?: number | null;
  remoteIp?: string | null;
  endpointId: string;
  createdAt?: Date;
}

interface EventInternalProps {
  method: string;
  headers: any;
  body: any;
  query: any;
  status: number | null;
  remoteIp: string | null;
  endpointId: string;
  createdAt: Date;
}

export class Event {
  private readonly _id: string;
  private props: EventInternalProps;

  private constructor(props: EventProps, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = {
      method: props.method,
      headers: props.headers,
      body: props.body,
      query: props.query,
      status: props.status ?? null,
      remoteIp: props.remoteIp ?? null,
      endpointId: props.endpointId,
      createdAt: props.createdAt || new Date(),
    };
  }

  static create(props: EventProps, id?: string): Event {
    return new Event(props, id);
  }

  get id() {
    return this._id;
  }
  get method() {
    return this.props.method;
  }
  get headers() {
    return this.props.headers;
  }
  get body() {
    return this.props.body;
  }
  get query() {
    return this.props.query;
  }
  get status() {
    return this.props.status;
  }
  get remoteIp() {
    return this.props.remoteIp;
  }
  get endpointId() {
    return this.props.endpointId;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  updateStatus(status: number) {
    this.props.status = status;
  }
}
