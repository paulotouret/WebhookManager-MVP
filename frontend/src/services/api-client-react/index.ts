
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { authApi, projectsApi, endpointsApi, eventsApi, usersApi } from '../api';
import type {
  User,
  Project,
  Endpoint,
  Event,
  UpdateProjectRequest,
  CreateEndpointRequest,
  UpdateEndpointRequest,
  ListEventsParams,
  ListEventsResponse,
  ReplayRequest,
} from '../api';



export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'],
  },
  projects: {
    all: () => ['projects'],
    list: () => [...queryKeys.projects.all(), 'list'],
    detail: (projectId: string) => [...queryKeys.projects.all(), 'detail', projectId],
  },
  endpoints: {
    all: () => ['endpoints'],
    list: (projectId: string) => [...queryKeys.endpoints.all(), 'list', projectId],
    detail: (projectId: string, endpointId: string) => [
      ...queryKeys.endpoints.all(),
      'detail',
      projectId,
      endpointId,
    ],
  },
  events: {
    all: () => ['events'],
    list: (projectId: string, endpointId: string, params?: ListEventsParams) => [
      ...queryKeys.events.all(),
      'list',
      projectId,
      endpointId,
      params,
    ],
  },
};



export function getListProjectsQueryKey() {
  return queryKeys.projects.list();
}

export function getGetMeQueryKey() {
  return queryKeys.auth.me();
}

export function getProjectQueryKey(projectId: string) {
  return queryKeys.projects.detail(projectId);
}

export function getListEndpointsQueryKey(projectId: string) {
  return queryKeys.endpoints.list(projectId);
}

export function getEndpointQueryKey(projectId: string, endpointId: string) {
  return queryKeys.endpoints.detail(projectId, endpointId);
}

export function getListEventsQueryKey(
  projectId: string,
  endpointId: string,
  params?: ListEventsParams
) {
  return queryKeys.events.list(projectId, endpointId, params);
}



export function useGetMe() {
  return useQuery<User, Error>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('hookflow_token', data.token);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('hookflow_token', data.token);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: usersApi.changePassword,
  });
}

export async function getMfaSetup() {
  return usersApi.getMfaSetup();
}

export function useEnableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.enableMfa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useDisableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.disableMfa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}



export function useListProjects() {
  return useQuery<Project[], Error>({
    queryKey: queryKeys.projects.list(),
    queryFn: projectsApi.list,
  });
}

export function useGetProject(projectId: string) {
  return useQuery<Project, Error>({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectsApi.get(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...data }: { projectId: string } & UpdateProjectRequest) => projectsApi.update(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId }: { projectId: string }) => projectsApi.delete(projectId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}



export function useListEndpoints(projectId: string) {
  return useQuery<Endpoint[], Error>({
    queryKey: queryKeys.endpoints.list(projectId),
    queryFn: () => endpointsApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useGetEndpoint(projectId: string, endpointId: string) {
  return useQuery<Endpoint, Error>({
    queryKey: queryKeys.endpoints.detail(projectId, endpointId),
    queryFn: () => endpointsApi.get(projectId, endpointId),
    enabled: !!projectId && !!endpointId,
  });
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...data }: { projectId: string } & CreateEndpointRequest) => endpointsApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints.list(projectId) });
    },
  });
}

export function useUpdateEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, endpointId, ...data }: { projectId: string; endpointId: string } & UpdateEndpointRequest) =>
      endpointsApi.update(projectId, endpointId, data),
    onSuccess: (_, { projectId, endpointId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints.list(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints.detail(projectId, endpointId) });
    },
  });
}

export function useDeleteEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, endpointId }: { projectId: string; endpointId: string }) =>
      endpointsApi.delete(projectId, endpointId),
    onSuccess: (_, { projectId, endpointId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints.list(projectId) });
      queryClient.removeQueries({ queryKey: queryKeys.endpoints.detail(projectId, endpointId) });
    },
  });
}



export function useListEvents(projectId: string, endpointId: string, params?: ListEventsParams) {
  return useQuery<ListEventsResponse, Error>({
    queryKey: queryKeys.events.list(projectId, endpointId, params),
    queryFn: () => eventsApi.list(endpointId, params),
    enabled: !!projectId && !!endpointId,
  });
}

export function useGetEvent(eventId: string) {
  return useQuery<Event, Error>({
    queryKey: ['events', 'detail', eventId],
    queryFn: () => eventsApi.get(eventId),
    enabled: !!eventId,
  });
}

export function useReplayEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, ...data }: { eventId: string } & ReplayRequest) => eventsApi.replay(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
    },
  });
}
