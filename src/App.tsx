import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { CustomCursor } from './components/ui/CustomCursor';
import { LandingPage } from './features/landing/LandingPage';
import { AuthPage } from './features/auth/AuthPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './features/dashboard/DashboardOverviewPage';
import { StudentDashboardPage } from './features/dashboard/StudentDashboardPage';
import { StudentManagementPage } from './features/students/StudentManagementPage';
import { AttendanceHistoryPage } from './features/history/AttendanceHistoryPage';
import { SecureAttendancePage } from './features/attendance/SecureAttendancePage';
import { SecureMessagePage } from './features/messages/SecureMessagePage';
import { AIAssistantPage } from './features/assistant/AIAssistantPage';
import { SecurityLabPage } from './features/securityLab/SecurityLabPage';
import { AuditCenterPage } from './features/audit/AuditCenterPage';
import { SettingsDocsPage } from './features/settings/SettingsDocsPage';
import { TamperAlertModal } from './components/modals/TamperAlertModal';
import { InstructorAttendanceEditModal } from './components/modals/InstructorAttendanceEditModal';
import { AttendanceHistoryDetailsModal } from './components/modals/AttendanceHistoryDetailsModal';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage />
        <TamperAlertModal />
      </>
    );
  }

  if (currentPage === 'auth') {
    return (
      <>
        <AuthPage />
        <TamperAlertModal />
      </>
    );
  }

  return (
    <DashboardLayout>
      {currentPage === 'dashboard' && <DashboardOverviewPage />}
      {currentPage === 'student-dashboard' && <StudentDashboardPage />}
      {currentPage === 'students' && <StudentManagementPage />}
      {currentPage === 'attendance' && <SecureAttendancePage />}
      {currentPage === 'history' && <AttendanceHistoryPage />}
      {currentPage === 'messages' && <SecureMessagePage />}
      {currentPage === 'assistant' && <AIAssistantPage />}
      {currentPage === 'lab' && <SecurityLabPage />}
      {currentPage === 'audit' && <AuditCenterPage />}
      {currentPage === 'settings' && <SettingsDocsPage />}

      {/* Global Modals for Tamper Alerts, Instructor Edits & Change History */}
      <TamperAlertModal />
      <InstructorAttendanceEditModal />
      <AttendanceHistoryDetailsModal />
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <CustomCursor />
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
