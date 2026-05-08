import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TopNav } from './components/TopNav';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { AdminPage } from './pages/AdminPage';
import { LandingPage } from './pages/LandingPage';
import { LearningPage } from './pages/LearningPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedAdminRoute } from './routes/ProtectedAdminRoute';
import { ProtectedRoleRoute } from './routes/ProtectedRoleRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="learn" replace />} />
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
          path="admin"
          element={
            <ProtectedRoleRoute allowedRoles={['admin']}>
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            </ProtectedRoleRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppLayout() {
  useSessionTimeout();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <TopNav />
      <Outlet />
    </main>
  );
}

export default App;
