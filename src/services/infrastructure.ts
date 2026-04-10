import api from '@/lib/api';
import {
  BuildingFilters,
  BuildingHierarchyItem,
  BuildingStatus,
  BuildingSummary,
  InfrastructureStats,
  RoomFilters,
  RoomStatus,
  RoomSummary,
  RoomType,
} from '@/types/infrastructure';

export interface CreateBuildingPayload {
  name: string;
  description?: string;
  floorCount?: number;
  status?: BuildingStatus;
}

export interface UpdateBuildingPayload extends Partial<CreateBuildingPayload> {}

export interface CreateRoomPayload {
  name: string;
  buildingId: string;
  floor?: number;
  capacity?: number;
  roomType: RoomType;
  status?: RoomStatus;
  description?: string;
  equipment?: string;
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

type ApiEnvelope<T> = {
  data: T;
};

const extractData = <T>(response: { data: ApiEnvelope<T> | T }) => {
  const payload = response.data as ApiEnvelope<T> | T;
  return (payload as ApiEnvelope<T>).data ?? (payload as T);
};

const buildQueryString = (params?: Record<string, string | number | undefined | null>) => {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

export const infrastructureApi = {
  async fetchStats(): Promise<InfrastructureStats> {
    const response = await api.get('/school-admin/infrastructure/stats');
    return extractData<InfrastructureStats>(response);
  },

  async fetchBuildings(filters: BuildingFilters = {}): Promise<BuildingSummary[]> {
    const response = await api.get(`/school-admin/infrastructure/buildings${buildQueryString(filters)}`);
    return extractData<BuildingSummary[]>(response);
  },

  async fetchBuilding(id: string): Promise<BuildingSummary & { rooms: RoomSummary[] }> {
    const response = await api.get(`/school-admin/infrastructure/buildings/${id}`);
    return extractData<BuildingSummary & { rooms: RoomSummary[] }>(response);
  },

  async createBuilding(payload: CreateBuildingPayload): Promise<BuildingSummary> {
    const response = await api.post('/school-admin/infrastructure/buildings', payload);
    return extractData<BuildingSummary>(response);
  },

  async updateBuilding(id: string, payload: UpdateBuildingPayload): Promise<BuildingSummary> {
    const response = await api.patch(`/school-admin/infrastructure/buildings/${id}`, payload);
    return extractData<BuildingSummary>(response);
  },

  async deleteBuilding(id: string): Promise<BuildingSummary> {
    const response = await api.delete(`/school-admin/infrastructure/buildings/${id}`);
    return extractData<BuildingSummary>(response);
  },

  async fetchRooms(filters: RoomFilters = {}): Promise<RoomSummary[]> {
    const response = await api.get(`/school-admin/infrastructure/rooms${buildQueryString(filters)}`);
    return extractData<RoomSummary[]>(response);
  },

  async fetchRoom(id: string): Promise<RoomSummary> {
    const response = await api.get(`/school-admin/infrastructure/rooms/${id}`);
    return extractData<RoomSummary>(response);
  },

  async createRoom(payload: CreateRoomPayload): Promise<RoomSummary> {
    const response = await api.post('/school-admin/infrastructure/rooms', payload);
    return extractData<RoomSummary>(response);
  },

  async updateRoom(id: string, payload: UpdateRoomPayload): Promise<RoomSummary> {
    const response = await api.patch(`/school-admin/infrastructure/rooms/${id}`, payload);
    return extractData<RoomSummary>(response);
  },

  async deleteRoom(id: string): Promise<RoomSummary> {
    const response = await api.delete(`/school-admin/infrastructure/rooms/${id}`);
    return extractData<RoomSummary>(response);
  },

  async fetchHierarchy(filters: RoomFilters = {}): Promise<BuildingHierarchyItem[]> {
    const response = await api.get(
      `/school-admin/infrastructure/hierarchy${buildQueryString(filters)}`,
    );
    return extractData<BuildingHierarchyItem[]>(response);
  },
};
