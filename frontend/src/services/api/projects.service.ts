
import { apiClient } from './api-client';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from './types';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  get: async (projectId: string): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${projectId}`);
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    return apiClient.post<Project>('/projects', data);
  },

  update: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    return apiClient.put<Project>(`/projects/${projectId}`, data);
  },

  delete: async (projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${projectId}`);
  },
};
