

export interface User {
  id: string;
  email: string;
  name: string | null;
  mfaEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  isActive: boolean;
  userId: string;
  endpointCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Endpoint {
  id: string;
  name: string;
  description: string | null;
  urlPath: string;
  webhookUrl: string;
  projectId: string;
  active: boolean;
  isActive: boolean;
  targetUrl: string | null;
  secret: string | null;
  eventCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, unknown>;
  body: unknown;
  query: Record<string, unknown>;
  status: number | null;
  remoteIp: string | null;
  receivedAt: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  statusCode: number | null;
}

export interface Replay {
  id: string;
  eventId: string;
  targetUrl: string | null;
  status: number;
  response: unknown | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateEndpointRequest {
  name: string;
  description?: string;
  targetUrl?: string;
  isActive?: boolean;
}

export interface UpdateEndpointRequest {
  name?: string;
  description?: string;
  targetUrl?: string;
  isActive?: boolean;
}

export interface ListEventsParams {
  page?: number;
  limit?: number;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListEventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReplayRequest {
  targetUrl: string;
}

export interface ReplayResponse {
  id: string;
  status: number;
  response: unknown;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
}

export interface EnableMfaRequest {
  code: string;
}

export interface EnableMfaResponse {
  backupCodes: string[];
}

export interface DisableMfaRequest {
  password: string;
}
