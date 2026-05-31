import crypto from 'node:crypto';

export interface ReplayProps {
  eventId: string;
  targetUrl: string | null;
  status: number;
  response: any;
  createdAt?: Date;
}

interface ReplayInternalProps {
  eventId: string;
  targetUrl: string | null;
  status: number;
  response: any;
  createdAt: Date;
}

export class Replay {
  private readonly _id: string;
  private props: ReplayInternalProps;

  private constructor(props: ReplayProps, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = {
      eventId: props.eventId,
      targetUrl: props.targetUrl ?? null,
      status: props.status,
      response: props.response ?? null,
      createdAt: props.createdAt || new Date(),
    };
  }

  static create(props: ReplayProps, id?: string): Replay {
    return new Replay(props, id);
  }

  get id() {
    return this._id;
  }
  get eventId() {
    return this.props.eventId;
  }
  get targetUrl() {
    return this.props.targetUrl;
  }
  get status() {
    return this.props.status;
  }
  get response() {
    return this.props.response;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
