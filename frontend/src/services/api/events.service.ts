
import { apiClient } from './api-client';
import type { Event, ListEventsParams, ListEventsResponse, ReplayRequest, ReplayResponse } from './types';

export const eventsApi = {
  list: async (
    endpointId: string,
    params?: ListEventsParams
  ): Promise<ListEventsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('endpointId', endpointId);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return apiClient.get<ListEventsResponse>(`/events?${queryParams.toString()}`);
  },

  get: async (eventId: string): Promise<Event> => {
    return apiClient.get<Event>(`/events/${eventId}`);
  },

  replay: async (eventId: string, data: ReplayRequest): Promise<ReplayResponse> => {
    return apiClient.post<ReplayResponse>('/replay', { eventId, ...data });
  },
};
