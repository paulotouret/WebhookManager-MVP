
import { apiClient } from './api-client';
import type { Endpoint, CreateEndpointRequest, UpdateEndpointRequest } from './types';

export const endpointsApi = {
  list: async (projectId: string): Promise<Endpoint[]> => {
    return apiClient.get<Endpoint[]>(`/endpoints?projectId=${projectId}`);
  },

  get: async (projectId: string, endpointId: string): Promise<Endpoint> => {
    return apiClient.get<Endpoint>(`/endpoints/${endpointId}?projectId=${projectId}`);
  },

  create: async (projectId: string, data: CreateEndpointRequest): Promise<Endpoint> => {
    return apiClient.post<Endpoint>('/endpoints', { ...data, projectId });
  },

  update: async (
    projectId: string,
    endpointId: string,
    data: UpdateEndpointRequest
  ): Promise<Endpoint> => {
    return apiClient.put<Endpoint>(`/endpoints/${endpointId}`, { ...data, projectId });
  },

  delete: async (projectId: string, endpointId: string): Promise<void> => {
    return apiClient.delete<void>(`/endpoints/${endpointId}?projectId=${projectId}`);
  },
};
