import { useEffect, useMemo, useState } from 'react';
import {
  DAYS_OF_WEEK,
  SchoolClass,
  Subject,
  Teacher,
  TimetableEntry,
  TimeSlot,
} from '@/types/academic';
import { RoomSummary, roomTypeLabels, statusLabels } from '@/types/infrastructure';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, Clock, MapPin, Trash2, User } from 'lucide-react';

interface TimeSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: TimetableEntry | null;
  day?: string;
  timeSlot?: TimeSlot;
  classId?: string;
  mode: 'create' | 'edit' | 'view';
  classes: SchoolClass[];
  subjects: Subject[];
  teachers: Teacher[];
  timeSlots: TimeSlot[];
  existingEntries: TimetableEntry[];
  rooms?: RoomSummary[];
  onSave: (data: TimeSlotFormData) => void;
  onDelete?: (entryId: string) => void;
}

export interface TimeSlotFormData {
  id?: string;
  day: string;
  timeSlotId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  room?: string | null;
}

const defaultDay = DAYS_OF_WEEK[0];

const normalizeText = (value?: string | null) => value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';

const formatTimeRange = (timeSlot: Pick<TimetableEntry['timeSlot'], 'startTime' | 'endTime'>) =>
  `${timeSlot.startTime} - ${timeSlot.endTime}`;

const getRoomLabel = (room: RoomSummary) => `${room.buildingName} - ${room.name}`;

const getRoomDetails = (room: RoomSummary) => {
  const floorLabel = room.floor === 0 ? 'RDC' : `Étage ${room.floor}`;
  const capacityLabel = `${room.capacity} place${room.capacity > 1 ? 's' : ''}`;
  return `${floorLabel} · ${capacityLabel} · ${roomTypeLabels[room.roomType]} · ${statusLabels[room.status]}`;
};

const buildConflictMessage = (
  entry: TimetableEntry,
  candidate: TimeSlotFormData,
): string | null => {
  if (entry.teacherId === candidate.teacherId) {
    return `Le professeur ${entry.teacher.firstName} ${entry.teacher.name} a déjà un cours le ${entry.day} de ${formatTimeRange(entry.timeSlot)}.`;
  }

  if (entry.classId === candidate.classId) {
    return `La classe ${entry.class.name} a déjà un cours à ${formatTimeRange(entry.timeSlot)}.`;
  }

  const candidateRoom = normalizeText(candidate.room);
  const entryRoom = normalizeText(entry.room);
  if (candidateRoom && entryRoom && candidateRoom === entryRoom) {
    return `La salle ${entry.room} est déjà occupée le ${entry.day} de ${formatTimeRange(entry.timeSlot)}.`;
  }

  return null;
};

function getConflict(
  candidate: TimeSlotFormData,
  entries: TimetableEntry[],
  excludeEntryId?: string,
): string | null {
  const conflict = entries.find((entry) => {
    if (excludeEntryId && entry.id === excludeEntryId) {
      return false;
    }
    if (entry.day !== candidate.day || entry.timeSlotId !== candidate.timeSlotId) {
      return false;
    }
    const candidateRoom = normalizeText(candidate.room);
    const entryRoom = normalizeText(entry.room);
    return (
      entry.teacherId === candidate.teacherId ||
      entry.classId === candidate.classId ||
      (candidateRoom !== '' && entryRoom !== '' && candidateRoom === entryRoom)
    );
  });

  return conflict ? buildConflictMessage(conflict, candidate) : null;
}

export function TimeSlotModal({
  open,
  onOpenChange,
  entry,
  day: initialDay,
  timeSlot: initialTimeSlot,
  classId: initialClassId,
  mode,
  classes,
  subjects,
  teachers,
  timeSlots,
  existingEntries,
  rooms = [],
  onSave,
  onDelete,
}: TimeSlotModalProps) {
  const [formData, setFormData] = useState<TimeSlotFormData>({
    day: initialDay || defaultDay,
    timeSlotId: initialTimeSlot?.id || timeSlots[0]?.id || '',
    classId: initialClassId || '',
    subjectId: '',
    teacherId: '',
    room: '',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (entry && mode !== 'create') {
      setFormData({
        id: entry.id,
        day: entry.day,
        timeSlotId: entry.timeSlotId,
        classId: entry.classId,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        room: entry.room || '',
      });
      return;
    }

    setFormData({
      day: initialDay || defaultDay,
      timeSlotId: initialTimeSlot?.id || timeSlots[0]?.id || '',
      classId: initialClassId || '',
      subjectId: '',
      teacherId: '',
      room: '',
    });
  }, [open, entry, mode, initialDay, initialTimeSlot, initialClassId, timeSlots]);

  const conflictMessage = useMemo(() => {
    if (mode === 'view') {
      return null;
    }

    if (!formData.classId || !formData.teacherId || !formData.day || !formData.timeSlotId) {
      return null;
    }

    return getConflict(formData, existingEntries, entry?.id);
  }, [entry?.id, existingEntries, formData, mode]);

  const selectedTimeSlot = useMemo(
    () => timeSlots.find((slot) => slot.id === formData.timeSlotId) ?? null,
    [formData.timeSlotId, timeSlots],
  );
  const selectedClass = useMemo(
    () => classes.find((item) => item.id === formData.classId) ?? null,
    [classes, formData.classId],
  );
  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === formData.subjectId) ?? null,
    [formData.subjectId, subjects],
  );
  const selectedTeacher = useMemo(
    () => teachers.find((item) => item.id === formData.teacherId) ?? null,
    [formData.teacherId, teachers],
  );
  const roomOptions = useMemo(
    () =>
      [...rooms].sort((left, right) => {
        const statusRank = (status: RoomSummary['status']) => {
          if (status === 'active') return 0;
          if (status === 'maintenance') return 1;
          return 2;
        };

        return (
          statusRank(left.status) - statusRank(right.status) ||
          left.buildingName.localeCompare(right.buildingName, 'fr', { sensitivity: 'base' }) ||
          left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' })
        );
      }),
    [rooms],
  );
  const selectedRoom = useMemo(() => {
    const value = normalizeText(formData.room);
    if (!value) {
      return null;
    }

    const exactMatch = roomOptions.find((room) => normalizeText(getRoomLabel(room)) === value);
    if (exactMatch) {
      return exactMatch;
    }

    const nameMatches = roomOptions.filter((room) => normalizeText(room.name) === value);
    return nameMatches.length === 1 ? nameMatches[0] : null;
  }, [formData.room, roomOptions]);

  const isReadOnly = mode === 'view';
  const canEdit = mode !== 'view';
  const isFixedCreate = mode === 'create' && Boolean(initialDay && initialTimeSlot && initialClassId);

  const handleSubmit = () => {
    if (conflictMessage) {
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!entry || !onDelete) {
      return;
    }

    onDelete(entry.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter un créneau' : mode === 'edit' ? 'Modifier le créneau' : 'Détails du cours'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? isFixedCreate
                ? 'Le jour, le créneau horaire et la classe sont déjà repris depuis la case sélectionnée.'
                : "Ajoutez un nouveau cours à l'emploi du temps"
              : mode === 'edit'
                ? 'Modifiez les informations du cours'
                : 'Informations sur le cours'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {conflictMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Conflit détecté</AlertTitle>
              <AlertDescription>{conflictMessage}</AlertDescription>
            </Alert>
          )}

          {isReadOnly && entry ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border bg-muted/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg">{entry.subject.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.class.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.class.level?.name || 'Sans niveau'}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {entry.day}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Jour</Label>
                  <p className="font-medium">{entry.day}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Horaire</Label>
                  <p className="flex items-center gap-1 font-medium">
                    <Clock className="h-4 w-4" />
                    {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Professeur</Label>
                  <p className="flex items-center gap-1 font-medium">
                    <User className="h-4 w-4" />
                    {entry.teacher.firstName} {entry.teacher.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Salle</Label>
                  <p className="flex items-center gap-1 font-medium">
                    <MapPin className="h-4 w-4" />
                    {entry.room || 'Non renseignée'}
                  </p>
                  {selectedRoom && (
                    <p className="text-xs text-muted-foreground">{getRoomDetails(selectedRoom)}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {isFixedCreate ? (
                <div className="grid gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Jour</Label>
                    <p className="font-medium">{initialDay}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Créneau horaire</Label>
                    <p className="font-medium">
                      {initialTimeSlot ? formatTimeRange(initialTimeSlot) : '—'}
                    </p>
                    {initialTimeSlot && (
                      <p className="text-xs text-muted-foreground">{initialTimeSlot.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Classe</Label>
                    <p className="font-medium">{selectedClass?.name ?? '—'}</p>
                    {selectedClass && (
                      <p className="text-xs text-muted-foreground">
                        {selectedClass.level?.name || 'Sans niveau'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="day">Jour</Label>
                    <Select
                      value={formData.day}
                      onValueChange={(value) => setFormData((current) => ({ ...current, day: value }))}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Créneau horaire</Label>
                    <Select
                      value={formData.timeSlotId}
                      onValueChange={(value) => setFormData((current) => ({ ...current, timeSlotId: value }))}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un créneau" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.startTime} - {slot.endTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTimeSlot && (
                      <p className="text-xs text-muted-foreground">
                        {selectedTimeSlot.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Classe</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData((current) => ({ ...current, classId: value }))}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {item.level?.name || 'Sans niveau'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClass && (
                      <p className="text-xs text-muted-foreground">
                        Capacité: {selectedClass.capacity} élèves
                        {' '}· Niveau: {selectedClass.level?.name || 'Sans niveau'}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Matière</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData((current) => ({ ...current, subjectId: value }))}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSubject && (
                  <p className="text-xs text-muted-foreground">
                    Code {selectedSubject.code} - Coefficient {selectedSubject.coefficient}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Professeur</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData((current) => ({ ...current, teacherId: value }))}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un professeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.name} - {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeacher && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTeacher.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-select">Salle</Label>
                <Select
                  value={selectedRoom ? getRoomLabel(selectedRoom) : ''}
                  onValueChange={(value) => setFormData((current) => ({ ...current, room: value }))}
                  disabled={!canEdit || roomOptions.length === 0}
                >
                  <SelectTrigger id="room-select">
                    <SelectValue placeholder="Sélectionner une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((room) => (
                      <SelectItem key={room.id} value={getRoomLabel(room)}>
                        {getRoomLabel(room)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRoom ? (
                  <p className="text-xs text-muted-foreground">{getRoomDetails(selectedRoom)}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez une salle enregistrée dans l'infrastructure.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 justify-end">
          {mode === 'edit' && onDelete && (
            <Button variant="destructive" onClick={handleDelete} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? 'Fermer' : 'Annuler'}
          </Button>
          {canEdit && (
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.day ||
                !formData.timeSlotId ||
                !formData.classId ||
                !formData.subjectId ||
                !formData.teacherId ||
                Boolean(conflictMessage)
              }
            >
              {mode === 'create' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmer la suppression',
  description = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
