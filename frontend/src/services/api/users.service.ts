import { apiClient } from './api-client';
import type {
  ChangePasswordRequest,
  DisableMfaRequest,
  EnableMfaRequest,
  EnableMfaResponse,
  MfaSetupResponse,
  UpdateProfileRequest,
  User,
} from './types';

export const usersApi = {
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put<User>('/users/me/profile', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>('/users/me/password', data);
  },

  getMfaSetup: async (): Promise<MfaSetupResponse> => {
    return apiClient.post<MfaSetupResponse>('/users/me/mfa/setup');
  },

  enableMfa: async (data: EnableMfaRequest): Promise<EnableMfaResponse> => {
    return apiClient.post<EnableMfaResponse>('/users/me/mfa/enable', data);
  },

  disableMfa: async (data: DisableMfaRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/users/me/mfa/disable', data);
  },
};
