export const CURRENT_ACADEMIC_SELECTION = 'current' as const;

type AcademicYearOption = {
  id: string;
  status?: string;
};

type SemesterOption = {
  id: string;
  academicYearId: string;
  status?: string;
};

export const resolveAcademicYearSelection = (
  selection: string,
  academicYears: AcademicYearOption[],
): string => {
  if (selection && selection !== CURRENT_ACADEMIC_SELECTION) {
    return selection;
  }

  return academicYears.find((year) => year.status === 'active')?.id ?? academicYears[0]?.id ?? '';
};

export const resolveSemesterSelection = (
  selection: string,
  academicYearId: string,
  semesters: SemesterOption[],
): string => {
  if (selection && selection !== CURRENT_ACADEMIC_SELECTION) {
    return selection;
  }

  const scopedSemesters = academicYearId
    ? semesters.filter((semester) => semester.academicYearId === academicYearId)
    : semesters;

  if (scopedSemesters.length > 0) {
    return scopedSemesters.find((semester) => semester.status === 'active')?.id ?? scopedSemesters[0].id;
  }

  if (academicYearId) {
    return '';
  }

  return semesters.find((semester) => semester.status === 'active')?.id ?? semesters[0]?.id ?? '';
};
