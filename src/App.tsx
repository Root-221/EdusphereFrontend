import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PasswordChangeDialog } from "@/components/auth/PasswordChangeDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { MobileLayout } from "./app/layouts/MobileLayout";
import { navigationByRole, mobileNavItems } from "./app/navigation";
import { UserRole } from "./types/auth";
import { Loader2 } from "lucide-react";

// Public pages
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

// Super Admin pages
const Schools = lazy(() => import("./pages/Schools"));
const SchoolAdmins = lazy(() => import("./pages/super-admin/SchoolAdmins"));
const PlatformStats = lazy(() => import("./pages/super-admin/Stats"));
const PlatformReports = lazy(() => import("./pages/super-admin/Reports"));
const PlatformLogs = lazy(() => import("./pages/super-admin/Logs"));
const PlatformSettings = lazy(() => import("./pages/super-admin/PlatformSettings"));

// School Admin pages
const AcademicYears = lazy(() => import("./pages/school-admin/AcademicYears"));
const Levels = lazy(() => import("./pages/school-admin/Levels"));
const Semesters = lazy(() => import("./pages/school-admin/Semesters"));
const Classes = lazy(() => import("./pages/school-admin/Classes"));
const Subjects = lazy(() => import("./pages/school-admin/Subjects"));
const Teachers = lazy(() => import("./pages/school-admin/Teachers"));
const Students = lazy(() => import("./pages/school-admin/Students"));
const Parents = lazy(() => import("./pages/school-admin/Parents"));
const SchoolBulletins = lazy(() => import("./pages/school-admin/Bulletins"));
const SchoolReports = lazy(() => import("./pages/school-admin/Reports"));
const SchoolSettings = lazy(() => import("./pages/school-admin/Settings"));
const SchoolEvaluations = lazy(() => import("./pages/school-admin/Evaluations"));
const SchoolInfrastructure = lazy(() => import("./pages/school-admin/Infrastructure"));
const SchoolStaff = lazy(() => import("./pages/school-admin/Staff"));
const Timetables = lazy(() => import("./pages/school-admin/Timetables"));
const Enrollments = lazy(() => import("./pages/school-admin/Enrollments"));
const SchoolLessonLogs = lazy(() => import("./pages/school-admin/LessonLogs"));
const SchoolAttendance = lazy(() => import("./pages/school-admin/Attendance"));

// Teacher pages
const MyClasses = lazy(() => import("./pages/teacher/MyClasses"));
const TeacherTimetable = lazy(() => import("./pages/teacher/Timetable"));
const LessonLogs = lazy(() => import("./pages/teacher/LessonLogs"));
const TeacherAttendance = lazy(() => import("./pages/teacher/Attendance"));
const TeacherEvaluations = lazy(() => import("./pages/teacher/Evaluations"));
const TeacherMessages = lazy(() => import("./pages/teacher/Messages"));
const TeacherHistory = lazy(() => import("./pages/teacher/History"));

// Student pages (mobile-first)
const StudentAssignments = lazy(() => import("./pages/student/Assignments"));
const StudentExams = lazy(() => import("./pages/student/Exams"));
const StudentGrades = lazy(() => import("./pages/student/Grades"));
const StudentBulletins = lazy(() => import("./pages/student/Bulletins"));
const StudentTimetable = lazy(() => import("./pages/student/Timetable"));
const StudentNotifications = lazy(() => import("./pages/student/Notifications"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentAcademicHistory = lazy(() => import("./pages/student/AcademicHistory"));
const StudentAttendance = lazy(() => import("./pages/student/Attendance"));
const StudentPayments = lazy(() => import("./pages/student/Payments"));

// Parent pages (mobile-first)
const Children = lazy(() => import("./pages/parent/Children"));
const ChildrenGrades = lazy(() => import("./pages/parent/Grades"));
const ChildrenBulletins = lazy(() => import("./pages/parent/Bulletins"));
const ChildrenTimetable = lazy(() => import("./pages/parent/Timetable"));
const ChildrenAttendance = lazy(() => import("./pages/parent/Attendance"));
const Payments = lazy(() => import("./pages/parent/Payments"));
const ParentNotifications = lazy(() => import("./pages/parent/Notifications"));
const ParentProfile = lazy(() => import("./pages/parent/Profile"));

// Accountant pages
const AccountantPayments = lazy(() => import("./pages/accountant/Payments"));
const AccountantTuition = lazy(() => import("./pages/accountant/Tuition"));
const AccountantReports = lazy(() => import("./pages/accountant/Reports"));

const queryClient = new QueryClient();

// Loading component
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

// Role-based route wrapper
function RoleBasedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Mobile route wrapper
function MobileRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const items = mobileNavItems[user.role] || [];
  
  return (
    <MobileLayout items={items}>
      {children}
    </MobileLayout>
  );
}

// Dashboard - role-based with mobile layout for student/parent
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Use mobile layout for student and parent
  const isMobileUser = user.role === 'student' || user.role === 'parent';
  
  if (isMobileUser) {
    const items = mobileNavItems[user.role] || [];
    return <MobileLayout items={items}>{children}</MobileLayout>;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PasswordChangeDialog />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Dashboard - role-based */}
              <Route path="/dashboard" element={
                <RoleBasedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </RoleBasedRoute>
              } />
              
              {/* Super Admin routes */}
              <Route path="/schools" element={
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AppLayout><Schools /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/school-admins" element={
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AppLayout><SchoolAdmins /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/stats" element={
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AppLayout><PlatformStats /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/reports" element={
                <RoleBasedRoute allowedRoles={['super_admin', 'school_admin']}>
                  <AppLayout><PlatformReports /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/logs" element={
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AppLayout><PlatformLogs /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/platform-settings" element={
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AppLayout><PlatformSettings /></AppLayout>
                </RoleBasedRoute>
              } />

              {/* School Admin routes */}
              <Route path="/academic-years" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><AcademicYears /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/levels" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Levels /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/semesters" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Semesters /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/classes" element={
                <RoleBasedRoute allowedRoles={['school_admin', 'teacher']}>
                  <AppLayout><Classes /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/subjects" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Subjects /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/teachers" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Teachers /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/students" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Students /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/parents" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Parents /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/bulletins" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolBulletins /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/settings" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolSettings /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/school-evaluations" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolEvaluations /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/infrastructure" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolInfrastructure /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/staff" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolStaff /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/timetables" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Timetables /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/enrollments" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><Enrollments /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/school-lesson-logs" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolLessonLogs /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/school-attendance" element={
                <RoleBasedRoute allowedRoles={['school_admin']}>
                  <AppLayout><SchoolAttendance /></AppLayout>
                </RoleBasedRoute>
              } />

              {/* Teacher routes */}
              <Route path="/my-classes" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><MyClasses /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/my-timetable" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherTimetable /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/lesson-logs" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><LessonLogs /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/teacher-attendance" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherAttendance /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/evaluations" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherEvaluations /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/messages" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherMessages /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/history" element={
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherHistory /></AppLayout>
                </RoleBasedRoute>
              } />

              {/* Student routes (mobile-first) */}
              <Route path="/my-assignments" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentAssignments /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/my-exams" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentExams /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/my-grades" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentGrades /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/my-bulletins" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentBulletins /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/timetable" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentTimetable /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/academic-history" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentAcademicHistory /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/attendance" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentAttendance /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/my-payments" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentPayments /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/notifications" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentNotifications /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/profile" element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <MobileRoute><StudentProfile /></MobileRoute>
                </RoleBasedRoute>
              } />

              {/* Parent routes (mobile-first) */}
              <Route path="/children" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><Children /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/children-grades" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ChildrenGrades /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/children-bulletins" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ChildrenBulletins /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/children-timetable" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ChildrenTimetable /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/children-attendance" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ChildrenAttendance /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/payments" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><Payments /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/parent-notifications" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ParentNotifications /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/notifications" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ParentNotifications /></MobileRoute>
                </RoleBasedRoute>
              } />
              <Route path="/parent-profile" element={
                <RoleBasedRoute allowedRoles={['parent']}>
                  <MobileRoute><ParentProfile /></MobileRoute>
                </RoleBasedRoute>
              } />

              {/* Accountant routes */}
              <Route path="/accountant-payments" element={
                <RoleBasedRoute allowedRoles={['accountant']}>
                  <AppLayout><AccountantPayments /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/tuition" element={
                <RoleBasedRoute allowedRoles={['accountant']}>
                  <AppLayout><AccountantTuition /></AppLayout>
                </RoleBasedRoute>
              } />
              <Route path="/financial-reports" element={
                <RoleBasedRoute allowedRoles={['accountant']}>
                  <AppLayout><AccountantReports /></AppLayout>
                </RoleBasedRoute>
              } />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
