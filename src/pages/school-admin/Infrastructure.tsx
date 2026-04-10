import { useState, useEffect, useMemo, type ComponentType } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataList, Column } from '@/components/ui/data-list';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Building,
  DoorOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  Dumbbell,
  FlaskConical,
  Computer,
  BookOpen,
  Utensils,
  MoreHorizontal,
  Eye,
  Layers,
  Trees,
  Droplets,
  LayoutList,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  BuildingHierarchyItem,
  BuildingStatus,
  BuildingSummary,
  InfrastructureStats,
  RoomStatus,
  RoomSummary,
  RoomType,
  roomTypeLabels,
  statusLabels,
} from '@/types/infrastructure';
import {
  CreateBuildingPayload,
  CreateRoomPayload,
  infrastructureApi,
  UpdateBuildingPayload,
  UpdateRoomPayload,
} from '@/services/infrastructure';

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusType = BuildingStatus;
type BuildingItem = BuildingSummary;
type Room = RoomSummary;

// ─── Constants ───────────────────────────────────────────────────────────────

const roomTypes: { value: RoomType; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: 'classe',       label: roomTypeLabels.classe,       icon: Building },
  { value: 'laboratoire',  label: roomTypeLabels.laboratoire,  icon: FlaskConical },
  { value: 'informatique', label: roomTypeLabels.informatique, icon: Computer },
  { value: 'bibliotheque', label: roomTypeLabels.bibliotheque, icon: BookOpen },
  { value: 'cantine',      label: roomTypeLabels.cantine,      icon: Utensils },
  { value: 'bureau',       label: roomTypeLabels.bureau,       icon: Building2 },
  { value: 'salle_reunion',label: roomTypeLabels.salle_reunion,icon: Users },
  { value: 'gymnase',      label: roomTypeLabels.gymnase,      icon: Dumbbell },
  { value: 'terrain',      label: roomTypeLabels.terrain,      icon: Trees },
  { value: 'sanitaire',    label: roomTypeLabels.sanitaire,    icon: Droplets },
  { value: 'autre',        label: roomTypeLabels.autre,        icon: MoreHorizontal },
];

const statusOptions: { value: StatusType; label: string }[] = [
  { value: 'active', label: statusLabels.active },
  { value: 'maintenance', label: statusLabels.maintenance },
  { value: 'inactive', label: statusLabels.inactive },
];

// ─── Pagination helper (same logic as DataList) ───────────────────────────────

function getPageNumbers(currentPage: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, 5];
  if (currentPage >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

// ─── Default form states ──────────────────────────────────────────────────────

type BuildingFormState = {
  name: string;
  description: string;
  floorCount: string;
  status: StatusType;
};

type RoomFormState = {
  name: string;
  buildingId: string;
  floor: string;
  capacity: string;
  roomType: RoomType;
  status: RoomStatus;
  description: string;
  equipment: string;
};

const createDefaultBuildingForm = (): BuildingFormState => ({
  name: '',
  description: '',
  floorCount: '1',
  status: 'active',
});

const createDefaultRoomForm = (): RoomFormState => ({
  name: '',
  buildingId: '',
  floor: '0',
  capacity: '30',
  roomType: 'classe',
  status: 'active',
  description: '',
  equipment: '',
});

const parseInteger = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: { message?: string; details?: string[] } }
      | undefined;
    return responseData?.error?.message ?? responseData?.error?.details?.[0] ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchoolInfrastructure() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('hierarchy');

  // Dialog states
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isEditBuildingOpen, setIsEditBuildingOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingHierarchyItem | null>(null);
  const [buildingToDelete, setBuildingToDelete] = useState<BuildingItem | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [roomBuildingFixedId, setRoomBuildingFixedId] = useState<string | null>(null);

  // Rooms tab filter
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Hierarchy tab filters & pagination
  const [hierFilterBuilding, setHierFilterBuilding] = useState('all');
  const [hierFilterFloor, setHierFilterFloor] = useState('all');
  const [hierFilterType, setHierFilterType] = useState('all');
  const [hierFilterStatus, setHierFilterStatus] = useState('all');
  const [hierPage, setHierPage] = useState(1);
  const HIER_PER_PAGE = 2;

  // Forms
  const [buildingForm, setBuildingForm] = useState<BuildingFormState>(createDefaultBuildingForm);
  const [roomForm, setRoomForm] = useState<RoomFormState>(createDefaultRoomForm);

  const statsQuery = useQuery<InfrastructureStats, Error>({
    queryKey: ['school-admin', 'infrastructure', 'stats'],
    queryFn: infrastructureApi.fetchStats,
    retry: false,
  });

  const buildingsQuery = useQuery<BuildingItem[], Error>({
    queryKey: ['school-admin', 'infrastructure', 'buildings'],
    queryFn: () => infrastructureApi.fetchBuildings(),
    retry: false,
  });

  const roomsQuery = useQuery<Room[], Error>({
    queryKey: ['school-admin', 'infrastructure', 'rooms'],
    queryFn: () => infrastructureApi.fetchRooms(),
    retry: false,
  });

  const hierarchyQuery = useQuery<BuildingHierarchyItem[], Error>({
    queryKey: [
      'school-admin',
      'infrastructure',
      'hierarchy',
      hierFilterBuilding,
      hierFilterFloor,
      hierFilterType,
      hierFilterStatus,
    ],
    queryFn: () =>
      infrastructureApi.fetchHierarchy({
        buildingId: hierFilterBuilding !== 'all' ? hierFilterBuilding : undefined,
        floor: hierFilterFloor !== 'all' ? parseInteger(hierFilterFloor, 0) : undefined,
        roomType: hierFilterType !== 'all' ? (hierFilterType as RoomType) : undefined,
        status: hierFilterStatus !== 'all' ? (hierFilterStatus as RoomStatus) : undefined,
      }),
    retry: false,
  });

  const buildings = buildingsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];
  const hierarchyBuildings = hierarchyQuery.data ?? [];

  const selectedRoomBuilding = useMemo(
    () => buildings.find((building) => building.id === roomForm.buildingId) ?? null,
    [buildings, roomForm.buildingId],
  );

  const allFloors = useMemo(
    () => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b),
    [rooms],
  );

  const effectiveStats: InfrastructureStats = statsQuery.data ?? {
    totalBuildings: buildings.length,
    totalRooms: rooms.length,
    activeRooms: rooms.filter((room) => room.status === 'active').length,
    maintenanceRooms: rooms.filter((room) => room.status === 'maintenance').length,
    inactiveRooms: rooms.filter((room) => room.status === 'inactive').length,
    totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
    occupancyRate: rooms.length > 0 ? Math.round((rooms.filter((room) => room.status === 'active').length / rooms.length) * 100) : 0,
  };

  const stats = [
    { label: 'Bâtiments', value: effectiveStats.totalBuildings, Icon: Building2, cls: 'bg-primary/10 text-primary' },
    { label: 'Salles totales', value: effectiveStats.totalRooms, Icon: DoorOpen, cls: 'bg-blue-50 text-blue-600' },
    { label: 'Salles actives', value: effectiveStats.activeRooms, Icon: CheckCircle2, cls: 'bg-green-50 text-green-600' },
    { label: 'En maintenance', value: effectiveStats.maintenanceRooms, Icon: AlertTriangle, cls: 'bg-yellow-50 text-yellow-600' },
  ];

  const invalidateInfrastructureQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ['school-admin', 'infrastructure'] });
  };

  const resetBuildingForm = () => setBuildingForm(createDefaultBuildingForm());
  const resetRoomForm = () => {
    setRoomForm(createDefaultRoomForm());
    setRoomBuildingFixedId(null);
  };

  const closeAddBuildingDialog = () => {
    setIsAddBuildingOpen(false);
    resetBuildingForm();
  };

  const closeEditBuildingDialog = () => {
    setIsEditBuildingOpen(false);
    setSelectedBuilding(null);
    resetBuildingForm();
  };

  const closeAddRoomDialog = () => {
    setIsAddRoomOpen(false);
    resetRoomForm();
  };

  const closeEditRoomDialog = () => {
    setIsEditRoomOpen(false);
    setSelectedRoom(null);
    resetRoomForm();
  };

  useEffect(() => {
    if (buildingFilter !== 'all' && !buildings.some((building) => building.id === buildingFilter)) {
      setBuildingFilter('all');
    }
  }, [buildingFilter, buildings]);

  useEffect(() => {
    if (hierFilterBuilding !== 'all' && !buildings.some((building) => building.id === hierFilterBuilding)) {
      setHierFilterBuilding('all');
    }
  }, [buildings, hierFilterBuilding]);

  useEffect(() => {
    if (hierPage > Math.max(1, Math.ceil(hierarchyBuildings.length / HIER_PER_PAGE))) {
      setHierPage(Math.max(1, Math.ceil(hierarchyBuildings.length / HIER_PER_PAGE)));
    }
  }, [hierPage, hierarchyBuildings.length]);

  useEffect(() => {
    if (statsQuery.error) {
      toast({
        title: 'Impossible de charger les statistiques',
        description: getApiErrorMessage(statsQuery.error, 'Réessayez plus tard.'),
      });
    }
  }, [statsQuery.error, toast]);

  useEffect(() => {
    if (buildingsQuery.error) {
      toast({
        title: 'Impossible de charger les bâtiments',
        description: getApiErrorMessage(buildingsQuery.error, 'Réessayez plus tard.'),
      });
    }
  }, [buildingsQuery.error, toast]);

  useEffect(() => {
    if (roomsQuery.error) {
      toast({
        title: 'Impossible de charger les salles',
        description: getApiErrorMessage(roomsQuery.error, 'Réessayez plus tard.'),
      });
    }
  }, [roomsQuery.error, toast]);

  useEffect(() => {
    if (hierarchyQuery.error) {
      toast({
        title: 'Impossible de charger la hiérarchie',
        description: getApiErrorMessage(hierarchyQuery.error, 'Réessayez plus tard.'),
      });
    }
  }, [hierarchyQuery.error, toast]);

  const createBuildingMutation = useMutation({
    mutationFn: (payload: CreateBuildingPayload) => infrastructureApi.createBuilding(payload),
    onSuccess: () => {
      toast({
        title: 'Bâtiment créé',
        description: 'Le bâtiment a été ajouté avec succès.',
      });
      closeAddBuildingDialog();
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de créer le bâtiment',
        description: getApiErrorMessage(error, 'Vérifiez les champs et réessayez.'),
      });
    },
  });

  const updateBuildingMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBuildingPayload }) =>
      infrastructureApi.updateBuilding(id, payload),
    onSuccess: () => {
      toast({
        title: 'Bâtiment mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      closeEditBuildingDialog();
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de mettre à jour le bâtiment',
        description: getApiErrorMessage(error, 'Vérifiez les champs et réessayez.'),
      });
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: (id: string) => infrastructureApi.deleteBuilding(id),
    onSuccess: (_, id) => {
      if (buildingFilter === id) {
        setBuildingFilter('all');
      }
      if (hierFilterBuilding === id) {
        setHierFilterBuilding('all');
      }
      setBuildingToDelete(null);
      toast({
        title: 'Bâtiment supprimé',
        description: 'Le bâtiment et ses salles ont été supprimés.',
      });
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de supprimer le bâtiment',
        description: getApiErrorMessage(error, 'Réessayez plus tard.'),
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (payload: CreateRoomPayload) => infrastructureApi.createRoom(payload),
    onSuccess: () => {
      toast({
        title: 'Salle créée',
        description: 'La salle a été ajoutée avec succès.',
      });
      closeAddRoomDialog();
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de créer la salle',
        description: getApiErrorMessage(error, 'Vérifiez les champs et réessayez.'),
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
      infrastructureApi.updateRoom(id, payload),
    onSuccess: () => {
      toast({
        title: 'Salle mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });
      closeEditRoomDialog();
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de mettre à jour la salle',
        description: getApiErrorMessage(error, 'Vérifiez les champs et réessayez.'),
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => infrastructureApi.deleteRoom(id),
    onSuccess: () => {
      setRoomToDelete(null);
      toast({
        title: 'Salle supprimée',
        description: 'La salle a été supprimée avec succès.',
      });
      invalidateInfrastructureQueries();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Impossible de supprimer la salle',
        description: getApiErrorMessage(error, 'Réessayez plus tard.'),
      });
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getStatusBadge = (status: StatusType) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">{statusLabels.active}</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">{statusLabels.maintenance}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{statusLabels.inactive}</Badge>;
    }
  };

  const getRoomTypeInfo = (type: RoomType) => roomTypes.find((t) => t.value === type) ?? roomTypes[roomTypes.length - 1];

  // ── Building CRUD ─────────────────────────────────────────────────────────

  const handleAddBuilding = () => {
    const payload: CreateBuildingPayload = {
      name: buildingForm.name.trim(),
      description: buildingForm.description.trim() || undefined,
      floorCount: parseInteger(buildingForm.floorCount, 1),
      status: buildingForm.status,
    };
    createBuildingMutation.mutate(payload);
  };

  const handleEditBuilding = () => {
    if (!selectedBuilding) return;
    const payload: UpdateBuildingPayload = {
      name: buildingForm.name.trim(),
      description: buildingForm.description.trim() || undefined,
      floorCount: parseInteger(buildingForm.floorCount, 1),
      status: buildingForm.status,
    };
    updateBuildingMutation.mutate({ id: selectedBuilding.id, payload });
  };

  const handleDeleteBuilding = () => {
    if (!buildingToDelete) return;
    deleteBuildingMutation.mutate(buildingToDelete.id);
  };

  const openEditBuilding = async (building: BuildingItem) => {
    setSelectedBuilding({ ...building, rooms: [] });
    setBuildingForm({
      name: building.name,
      description: building.description ?? '',
      floorCount: building.floorCount.toString(),
      status: building.status,
    });
    setIsEditBuildingOpen(true);

    try {
      const detail = await infrastructureApi.fetchBuilding(building.id);
      setSelectedBuilding(detail);
    } catch {
      // The edit form can still rely on the list payload if the detail fetch fails.
    }
  };

  // ── Room CRUD ─────────────────────────────────────────────────────────────

  const handleAddRoom = () => {
    const payload: CreateRoomPayload = {
      name: roomForm.name.trim(),
      buildingId: roomForm.buildingId,
      floor: parseInteger(roomForm.floor, 0),
      capacity: parseInteger(roomForm.capacity, 30),
      roomType: roomForm.roomType,
      status: roomForm.status,
      description: roomForm.description.trim() || undefined,
      equipment: roomForm.equipment.trim() || undefined,
    };
    createRoomMutation.mutate(payload);
  };

  const handleEditRoom = () => {
    if (!selectedRoom) return;
    const payload: UpdateRoomPayload = {
      name: roomForm.name.trim(),
      buildingId: roomForm.buildingId,
      floor: parseInteger(roomForm.floor, 0),
      capacity: parseInteger(roomForm.capacity, 30),
      roomType: roomForm.roomType,
      status: roomForm.status,
      description: roomForm.description.trim() || undefined,
      equipment: roomForm.equipment.trim() || undefined,
    };
    updateRoomMutation.mutate({ id: selectedRoom.id, payload });
  };

  const handleDeleteRoom = () => {
    if (!roomToDelete) return;
    deleteRoomMutation.mutate(roomToDelete.id);
  };

  const openEditRoom = async (room: Room) => {
    setSelectedRoom(room);
    setRoomForm({
      name: room.name,
      buildingId: room.buildingId,
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
      roomType: room.roomType,
      status: room.status,
      description: room.description ?? '',
      equipment: room.equipment ?? '',
    });
    setIsEditRoomOpen(true);

    try {
      const detail = await infrastructureApi.fetchRoom(room.id);
      setSelectedRoom(detail);
      setRoomForm({
        name: detail.name,
        buildingId: detail.buildingId,
        floor: detail.floor.toString(),
        capacity: detail.capacity.toString(),
        roomType: detail.roomType,
        status: detail.status,
        description: detail.description ?? '',
        equipment: detail.equipment ?? '',
      });
    } catch {
      // Fall back to the row data already loaded in the grid/table.
    }
  };

  const openAddRoomForBuilding = (buildingId: string) => {
    setRoomForm({ ...createDefaultRoomForm(), buildingId });
    setRoomBuildingFixedId(buildingId);
    setIsAddRoomOpen(true);
  };

  const openAddRoom = () => {
    if (buildings.length === 0) {
      toast({
        title: 'Créez d’abord un bâtiment',
        description: 'La salle doit toujours être rattachée à un bâtiment.',
      });
      return;
    }
    setRoomForm(createDefaultRoomForm());
    setRoomBuildingFixedId(null);
    setIsAddRoomOpen(true);
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const filteredRooms = buildingFilter && buildingFilter !== 'all'
    ? rooms.filter((room) => room.buildingId === buildingFilter)
    : rooms;

  // ── Hierarchy derived values ──────────────────────────────────────────────

  const hierBuildings = hierarchyBuildings;
  const getHierRooms = (buildingId: string) =>
    hierarchyBuildings.find((building) => building.id === buildingId)?.rooms ?? [];

  const hierTotalPages = Math.max(1, Math.ceil(hierBuildings.length / HIER_PER_PAGE));
  const hierPaginatedBuildings = hierBuildings.slice(
    (hierPage - 1) * HIER_PER_PAGE,
    hierPage * HIER_PER_PAGE,
  );
  const hasHierFilters =
    hierFilterBuilding !== 'all' ||
    hierFilterFloor !== 'all' ||
    hierFilterType !== 'all' ||
    hierFilterStatus !== 'all';

  const resetHierFilters = () => {
    setHierFilterBuilding('all');
    setHierFilterFloor('all');
    setHierFilterType('all');
    setHierFilterStatus('all');
  };

  // Reset page when filters change
  useEffect(() => {
    setHierPage(1);
  }, [hierFilterBuilding, hierFilterFloor, hierFilterType, hierFilterStatus]);

  useEffect(() => {
    if (hierPage > hierTotalPages) {
      setHierPage(hierTotalPages);
    }
  }, [hierPage, hierTotalPages]);

  // ── Column definitions ────────────────────────────────────────────────────

  const buildingColumns: Column<BuildingItem>[] = [
    {
      key: 'name',
      label: 'Bâtiment',
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.floorCount} étage(s)</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rooms' as keyof BuildingItem,
      label: 'Salles',
      render: (b) => <span className="font-medium">{b.roomCount}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (b) => getStatusBadge(b.status),
    },
    {
      key: 'actions' as keyof BuildingItem,
      label: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => { setBuildingFilter(b.id); setActiveTab('rooms'); }} >
            <Eye className="h-3.5 w-3.5 mr-1" />Salles
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { void openEditBuilding(b); }}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setBuildingToDelete(b)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le bâtiment</AlertDialogTitle>
                <AlertDialogDescription>
                  Toutes les salles rattachées à "{b.name}" seront aussi supprimées. Confirmer?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBuilding} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const roomColumns: Column<Room>[] = [
    {
      key: 'name',
      label: 'Salle',
      sortable: true,
      render: (room) => {
        const { icon: Icon, label } = getRoomTypeInfo(room.roomType);
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'buildingName', label: 'Bâtiment', render: (r) => <span className="text-sm">{r.buildingName || r.building?.name || '—'}</span> },
    { key: 'floor',        label: 'Étage',     render: (r) => <span className="text-sm">{r.floor === 0 ? 'RDC' : `Étage ${r.floor}`}</span> },
    { key: 'capacity',     label: 'Capacité',  render: (r) => <span className="text-sm">{r.capacity} pers.</span> },
    { key: 'status',       label: 'Statut',    render: (r) => getStatusBadge(r.status) },
    {
      key: 'actions' as keyof Room,
      label: 'Actions',
      render: (room) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => { void openEditRoom(room); }}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRoomToDelete(room)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la salle</AlertDialogTitle>
                <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{room.name}" ?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // ── Grid items ────────────────────────────────────────────────────────────

  const buildingGridItem = (building: BuildingItem) => {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{building.name}</h3>
            {getStatusBadge(building.status)}
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-3 w-3" />{building.floorCount} étage(s)
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <DoorOpen className="h-3 w-3" />{building.roomCount} salle(s)
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />{building.activeRoomCount} salle(s) active(s)
          </span>
          {building.description && (
            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{building.description}</p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline" size="sm" className="gap-1 flex-1"
            onClick={() => { setBuildingFilter(building.id); setActiveTab('rooms'); }}
            >
            <Eye className="h-3 w-3" />Voir Salles
          </Button>
          <Button variant="outline" size="sm" title="Ajouter une salle" onClick={() => openAddRoomForBuilding(building.id)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { void openEditBuilding(building); }}>
            <Edit className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setBuildingToDelete(building)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le bâtiment</AlertDialogTitle>
                <AlertDialogDescription>
                  Toutes les salles rattachées à "{building.name}" seront aussi supprimées. Confirmer?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBuilding} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };

  const roomGridItem = (room: Room) => {
    const { icon: Icon } = getRoomTypeInfo(room.roomType);
    const { label } = getRoomTypeInfo(room.roomType);
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{room.name}</h3>
            {getStatusBadge(room.status)}
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3 w-3" />{room.buildingName || room.building?.name || '—'}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Layers className="h-3 w-3" />{room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-3 w-3" />{room.capacity} personnes</span>
          <span className="flex items-center gap-2 text-muted-foreground"><DoorOpen className="h-3 w-3" />{label}</span>
          {room.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2 italic">{room.description}</p>}
          {room.equipment && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{room.equipment}</p>}
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => { void openEditRoom(room); }}>
            <Edit className="h-3 w-3" />Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setRoomToDelete(room)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la salle</AlertDialogTitle>
                <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{room.name}" ?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Infrastructure</h1>
          <p className="text-muted-foreground">Gérez les bâtiments et leurs salles — toute salle doit appartenir à un bâtiment.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setBuildingForm(createDefaultBuildingForm()); setIsAddBuildingOpen(true); }}>
            <Building className="h-4 w-4" />
            Nouveau Bâtiment
          </Button>
          <Button className="gap-2" onClick={openAddRoom} disabled={buildings.length === 0}>
            <Plus className="h-4 w-4" />
            Nouvelle Salle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.cls}`}>
                <s.Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="hierarchy" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Vue par Bâtiment
          </TabsTrigger>
          <TabsTrigger value="buildings" className="gap-2">
            <Building className="h-4 w-4" />
            Bâtiments ({buildings.length})
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            Salles ({rooms.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Vue hiérarchique ── */}
        <TabsContent value="hierarchy" className="space-y-4">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-xl border">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

            <Select value={hierFilterBuilding} onValueChange={setHierFilterBuilding}>
              <SelectTrigger className="w-[190px] bg-background h-9 text-sm">
                <SelectValue placeholder="Tous les bâtiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les bâtiments</SelectItem>
                {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={hierFilterFloor} onValueChange={setHierFilterFloor}>
              <SelectTrigger className="w-[150px] bg-background h-9 text-sm">
                <SelectValue placeholder="Tous les étages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les étages</SelectItem>
                {allFloors.map(f => (
                  <SelectItem key={f} value={f.toString()}>
                    {f === 0 ? 'RDC' : `Étage ${f}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hierFilterType} onValueChange={setHierFilterType}>
              <SelectTrigger className="w-[180px] bg-background h-9 text-sm">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {roomTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />{t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hierFilterStatus} onValueChange={setHierFilterStatus}>
              <SelectTrigger className="w-[160px] bg-background h-9 text-sm">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasHierFilters && (
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-9" onClick={resetHierFilters}>
                <X className="h-3.5 w-3.5" />Réinitialiser
              </Button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {hierBuildings.length} bâtiment(s) · {hierBuildings.reduce((acc, b) => acc + getHierRooms(b.id).length, 0)} salle(s)
            </span>
          </div>

          {/* Empty states */}
          {buildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Building2 className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-1">Aucun bâtiment</h3>
              <p className="text-sm mb-4">Créez d'abord un bâtiment avant d'ajouter des salles.</p>
              <Button onClick={() => { setBuildingForm(createDefaultBuildingForm()); setIsAddBuildingOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Nouveau Bâtiment
              </Button>
            </div>
          ) : hierBuildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Building className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun bâtiment ne correspond aux filtres</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={resetHierFilters}>
                <X className="h-3.5 w-3.5 mr-1" />Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              {/* Accordion — collapsed by default */}
              <Accordion type="multiple" defaultValue={[]} className="space-y-3">
                {hierPaginatedBuildings.map(building => {
                  const buildingRooms = getHierRooms(building.id);
                  const totalBuildingRooms = rooms.filter(r => r.buildingId === building.id).length;
                  return (
                    <AccordionItem
                      key={building.id}
                      value={building.id}
                      className="border rounded-xl overflow-hidden shadow-card bg-card"
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:bg-muted/10">
                        <div className="flex items-center gap-3 flex-1 mr-4 text-left">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{building.name}</span>
                              {getStatusBadge(building.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{building.floorCount} étage(s)</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <DoorOpen className="h-3 w-3" />
                                {hasHierFilters && buildingRooms.length !== totalBuildingRooms
                                  ? <>{buildingRooms.length} / {totalBuildingRooms} salle(s) correspondante(s)</>
                                  : <>{totalBuildingRooms} salle(s)</>
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-5 pb-5">
                        {/* Building description + actions */}
                        <div className="flex items-start justify-between gap-4 pt-2 mb-4">
                          <p className="text-sm text-muted-foreground flex-1">
                            {building.description || 'Aucune description.'}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => { void openEditBuilding(building); }}>
                              <Edit className="h-3 w-3 mr-1" />Modifier
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setBuildingToDelete(building)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le bâtiment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Les {totalBuildingRooms} salle(s) rattachées à "{building.name}" seront aussi supprimées. Confirmer?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteBuilding} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <Separator className="mb-4" />

                        {/* Room list */}
                        <div className="space-y-2">
                          {buildingRooms.map(room => {
                            const { icon: Icon, label } = getRoomTypeInfo(room.roomType);
                            return (
                              <div
                                key={room.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">{room.name}</span>
                                    {getStatusBadge(room.status)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                    <span>{label}</span>
                                    <span>•</span>
                                    <span>{room.floor === 0 ? 'RDC' : `Étage ${room.floor}`}</span>
                                    <span>•</span>
                                    <span>{room.capacity} pers.</span>
                                    {room.description && (
                                      <><span>•</span><span className="italic">{room.description}</span></>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Modifier" onClick={() => { void openEditRoom(room); }}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setRoomToDelete(room)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer la salle</AlertDialogTitle>
                                        <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{room.name}" ?</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            );
                          })}

                          {buildingRooms.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                              <DoorOpen className="h-10 w-10 mb-2 opacity-25" />
                              <p className="text-sm">
                                {hasHierFilters ? 'Aucune salle ne correspond aux filtres dans ce bâtiment' : 'Aucune salle dans ce bâtiment'}
                              </p>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 mt-2 border-dashed text-muted-foreground hover:text-foreground"
                            onClick={() => openAddRoomForBuilding(building.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter une salle dans ce bâtiment
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Pagination — même style que DataList */}
              {hierTotalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {(hierPage - 1) * HIER_PER_PAGE + 1} à {Math.min(hierPage * HIER_PER_PAGE, hierBuildings.length)} sur {hierBuildings.length} bâtiment{hierBuildings.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHierPage(1)} disabled={hierPage === 1}>
                      <ChevronFirst className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHierPage(p => p - 1)} disabled={hierPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers(hierPage, hierTotalPages).map(pageNum => (
                      <Button
                        key={pageNum}
                        variant={hierPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setHierPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHierPage(p => p + 1)} disabled={hierPage === hierTotalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setHierPage(hierTotalPages)} disabled={hierPage === hierTotalPages}>
                      <ChevronLast className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Bâtiments ── */}
        <TabsContent value="buildings">
          <DataList
            data={buildings}
            columns={buildingColumns}
            searchKey="name"
            searchPlaceholder="Rechercher un bâtiment..."
            defaultView="grid"
            gridItem={buildingGridItem}
            emptyMessage="Aucun bâtiment trouvé"
            itemsPerPage={6}
          />
        </TabsContent>

        {/* ── Salles ── */}
        <TabsContent value="rooms">
          <div className="flex flex-col gap-3 md:flex-row md:items-center mb-4">
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Tous les bâtiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les bâtiments</SelectItem>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {buildingFilter && buildingFilter !== 'all' && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setBuildingFilter('all')}>
                Effacer le filtre
              </Button>
            )}
          </div>
          <DataList
            data={filteredRooms}
            columns={roomColumns}
            searchKey="name"
            searchPlaceholder="Rechercher une salle..."
            defaultView="grid"
            gridItem={roomGridItem}
            emptyMessage="Aucune salle trouvée"
            itemsPerPage={8}
          />
        </TabsContent>
      </Tabs>

      {/* ── Add Building Dialog ── */}
      <Dialog open={isAddBuildingOpen} onOpenChange={(open) => (open ? setIsAddBuildingOpen(true) : closeAddBuildingDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un bâtiment</DialogTitle>
            <DialogDescription>Les salles seront obligatoirement rattachées à un bâtiment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nom du bâtiment *</Label>
              <Input value={buildingForm.name} onChange={e => setBuildingForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Bâtiment A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre d'étages</Label>
                <Input type="number" min="0" value={buildingForm.floorCount} onChange={e => setBuildingForm(f => ({ ...f, floorCount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={buildingForm.status} onValueChange={(v: StatusType) => setBuildingForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={buildingForm.description} onChange={e => setBuildingForm(f => ({ ...f, description: e.target.value }))} placeholder="Description du bâtiment..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddBuildingDialog}>Annuler</Button>
            <Button onClick={handleAddBuilding} disabled={!buildingForm.name.trim() || createBuildingMutation.isPending}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Building Dialog ── */}
      <Dialog open={isEditBuildingOpen} onOpenChange={(open) => (open ? setIsEditBuildingOpen(true) : closeEditBuildingDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le bâtiment</DialogTitle>
            <DialogDescription>Modifiez les informations du bâtiment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nom du bâtiment *</Label>
              <Input value={buildingForm.name} onChange={e => setBuildingForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre d'étages</Label>
                <Input type="number" min="0" value={buildingForm.floorCount} onChange={e => setBuildingForm(f => ({ ...f, floorCount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={buildingForm.status} onValueChange={(v: StatusType) => setBuildingForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={buildingForm.description} onChange={e => setBuildingForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditBuildingDialog}>Annuler</Button>
            <Button onClick={handleEditBuilding} disabled={!buildingForm.name.trim() || updateBuildingMutation.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Room Dialog ── */}
      <Dialog open={isAddRoomOpen} onOpenChange={(open) => (open ? setIsAddRoomOpen(true) : closeAddRoomDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une salle</DialogTitle>
            <DialogDescription>
              {roomBuildingFixedId
                ? 'La salle sera créée directement dans ce bâtiment.'
                : 'La salle doit être rattachée à un bâtiment existant.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la salle *</Label>
              <Input value={roomForm.name} onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Salle A101" />
            </div>
            {!roomBuildingFixedId && (
              <div className="space-y-2">
                <Label>Bâtiment *</Label>
                <Select value={roomForm.buildingId} onValueChange={v => setRoomForm(f => ({ ...f, buildingId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un bâtiment" /></SelectTrigger>
                  <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Type de salle</Label>
              <Select value={roomForm.roomType} onValueChange={(v: RoomType) => setRoomForm(f => ({ ...f, roomType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roomTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Étage</Label>
                <Input type="number" min="0" max={selectedRoomBuilding?.floorCount ?? undefined} value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} />
                {selectedRoomBuilding && (
                  <p className="text-xs text-muted-foreground">Maximum autorisé: {selectedRoomBuilding.floorCount}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={roomForm.status} onValueChange={(v: StatusType) => setRoomForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes / Description</Label>
              <Textarea rows={2} value={roomForm.description} onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes sur la salle (optionnel)..." />
            </div>
            <div className="space-y-2">
              <Label>Équipements / matériel</Label>
              <Textarea rows={2} value={roomForm.equipment} onChange={e => setRoomForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Ex: tableaux, vidéoprojecteur, ordinateurs..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddRoomDialog}>Annuler</Button>
            <Button onClick={handleAddRoom} disabled={!roomForm.name.trim() || !roomForm.buildingId || createRoomMutation.isPending}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Room Dialog ── */}
      <Dialog open={isEditRoomOpen} onOpenChange={(open) => (open ? setIsEditRoomOpen(true) : closeEditRoomDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la salle</DialogTitle>
            <DialogDescription>Modifiez les informations de la salle.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la salle *</Label>
              <Input value={roomForm.name} onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Bâtiment *</Label>
              <Select value={roomForm.buildingId} onValueChange={v => setRoomForm(f => ({ ...f, buildingId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un bâtiment" /></SelectTrigger>
                <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de salle</Label>
              <Select value={roomForm.roomType} onValueChange={(v: RoomType) => setRoomForm(f => ({ ...f, roomType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roomTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Étage</Label>
                <Input type="number" min="0" max={selectedRoomBuilding?.floorCount ?? undefined} value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} />
                {selectedRoomBuilding && (
                  <p className="text-xs text-muted-foreground">Maximum autorisé: {selectedRoomBuilding.floorCount}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={roomForm.status} onValueChange={(v: StatusType) => setRoomForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes / Description</Label>
              <Textarea rows={2} value={roomForm.description} onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Équipements / matériel</Label>
              <Textarea rows={2} value={roomForm.equipment} onChange={e => setRoomForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Ex: tableaux, vidéoprojecteur, ordinateurs..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditRoomDialog}>Annuler</Button>
            <Button onClick={handleEditRoom} disabled={!roomForm.name.trim() || !roomForm.buildingId || updateRoomMutation.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
