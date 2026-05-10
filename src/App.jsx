import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AdminWorkspace } from './admin/AdminWorkspace';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminDiscoveryPage } from './admin/pages/AdminDiscoveryPage';
import { AdminIngestPage } from './admin/pages/AdminIngestPage';
import { AdminQueuePage } from './admin/pages/AdminQueuePage';
import { AdminRawFeedPage } from './admin/pages/AdminRawFeedPage';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { AdminPortalLayout } from './layouts/AdminPortalLayout';
import { LearnerLayout } from './layouts/LearnerLayout';
import { ChatPage } from './pages/ChatPage';
import { LandingPage } from './pages/LandingPage';
import { LearningPage } from './pages/LearningPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BillingDemoPaymentPage } from './pages/BillingDemoPaymentPage';
import { BillingPlansPage } from './pages/BillingPlansPage';
import { LearnerAccountPage } from './pages/LearnerAccountPage';
import { LearnerLoginPage } from './pages/LearnerLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedAdminRoute } from './routes/ProtectedAdminRoute';
import { ProtectedJwtRoute } from './routes/ProtectedJwtRoute';
import { ProtectedRoleRoute } from './routes/ProtectedRoleRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LearnerLoginPage />} />
      <Route path="/app" element={<AppRoot />}>
        <Route index element={<Navigate to="learn" replace />} />
        <Route element={<LearnerLayout />}>
          <Route
            path="learn"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <LearningPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="learn/:moduleId"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <LessonDetailPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <ProtectedJwtRoute>
                  <ChatPage />
                </ProtectedJwtRoute>
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="account"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <ProtectedJwtRoute>
                  <LearnerAccountPage />
                </ProtectedJwtRoute>
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="plans"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <BillingPlansPage />
              </ProtectedRoleRoute>
            }
          />
          <Route
            path="billing/demo"
            element={
              <ProtectedRoleRoute allowedRoles={['learner', 'admin']}>
                <ProtectedJwtRoute>
                  <BillingDemoPaymentPage />
                </ProtectedJwtRoute>
              </ProtectedRoleRoute>
            }
          />
        </Route>
        <Route element={<AdminPortalLayout />}>
          <Route
            path="admin"
            element={
              <ProtectedRoleRoute allowedRoles={['admin']}>
                <ProtectedAdminRoute>
                  <AdminWorkspace />
                </ProtectedAdminRoute>
              </ProtectedRoleRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="temukan" element={<AdminDiscoveryPage />} />
            <Route path="tambah" element={<AdminIngestPage />} />
            <Route path="antrian" element={<AdminQueuePage />} />
            <Route path="mentah" element={<AdminRawFeedPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppRoot() {
  useSessionTimeout();
  return (
    <main className="mx-auto px-4 py-6 md:px-6">
      <Outlet />
    </main>
  );
}

export default App;
