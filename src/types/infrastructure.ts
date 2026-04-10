// src/types/infrastructure.ts - Types for school buildings and rooms

export type BuildingStatus = 'active' | 'maintenance' | 'inactive';

export type RoomStatus = 'active' | 'maintenance' | 'inactive';

export type RoomType =
  | 'classe'
  | 'laboratoire'
  | 'informatique'
  | 'bibliotheque'
  | 'cantine'
  | 'bureau'
  | 'salle_reunion'
  | 'gymnase'
  | 'terrain'
  | 'sanitaire'
  | 'autre';

export interface Building {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  floorCount: number;
  status: BuildingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  schoolId: string;
  buildingId: string;
  name: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
  status: RoomStatus;
  description?: string;
  equipment?: string;
  createdAt: string;
  updatedAt: string;
  building?: Building;
}

export interface InfrastructureStats {
  totalBuildings: number;
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  inactiveRooms: number;
  totalCapacity: number;
  occupancyRate: number;
}

export interface BuildingSummary extends Building {
  roomCount: number;
  activeRoomCount: number;
  maintenanceRoomCount: number;
  inactiveRoomCount: number;
  totalCapacity: number;
  occupancyRate: number;
}

export interface RoomSummary extends Omit<Room, 'building'> {
  buildingName: string;
  building?: Pick<Building, 'id' | 'name' | 'floorCount' | 'status'>;
}

export interface BuildingHierarchyItem extends BuildingSummary {
  rooms: RoomSummary[];
}

export interface BuildingFilters {
  search?: string;
  status?: BuildingStatus;
}

export interface RoomFilters {
  search?: string;
  buildingId?: string;
  status?: RoomStatus;
  roomType?: RoomType;
  floor?: number;
}

export type BuildingStats = InfrastructureStats;

// Room labels for UI
export const roomTypeLabels: Record<RoomType, string> = {
  classe: 'Salle de classe',
  laboratoire: 'Laboratoire',
  informatique: 'Salle informatique',
  bibliotheque: 'Bibliothèque',
  cantine: 'Cantine',
  bureau: 'Bureau',
  salle_reunion: 'Salle de réunion',
  gymnase: 'Gymnase',
  terrain: 'Terrain extérieur',
  sanitaire: 'Sanitaire',
  autre: 'Autre',
};

export const statusLabels: Record<BuildingStatus | RoomStatus, string> = {
  active: 'Actif',
  maintenance: 'En maintenance',
  inactive: 'Inactif',
};
