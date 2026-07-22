import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { FirstAccessPage } from './pages/auth/FirstAccessPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { UserFormPage } from './pages/users/UserFormPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { EmployeesListPage } from './pages/employees/EmployeesListPage';
import { EmployeeFormPage } from './pages/employees/EmployeeFormPage';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage';
import { TrainingsListPage } from './pages/trainings/TrainingsListPage';
import { TrainingFormPage } from './pages/trainings/TrainingFormPage';
import { AsosListPage } from './pages/asos/AsosListPage';
import { AsoFormPage } from './pages/asos/AsoFormPage';
import { OccurrencesListPage } from './pages/occurrences/OccurrencesListPage';
import { OccurrenceFormPage } from './pages/occurrences/OccurrenceFormPage';
import { VehiclesListPage } from './pages/vehicles/VehiclesListPage';
import { VehicleFormPage } from './pages/vehicles/VehicleFormPage';
import { DriversListPage } from './pages/vehicles/DriversListPage';
import { DriverFormPage } from './pages/vehicles/DriverFormPage';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { useAuthStore } from './stores/authStore';
import { usePreline } from './hooks/usePreline';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  usePreline();

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/first-access" element={<FirstAccessPage />} />
      </Route>
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<UserFormPage />} />
        <Route path="/users/:id" element={<UserFormPage />} />
        <Route path="/users/:id/edit" element={<UserFormPage />} />
        <Route path="/employees" element={<EmployeesListPage />} />
        <Route path="/employees/new" element={<EmployeeFormPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="/trainings" element={<TrainingsListPage />} />
        <Route path="/trainings/new" element={<TrainingFormPage />} />
        <Route path="/trainings/:id/edit" element={<TrainingFormPage />} />
        <Route path="/asos" element={<AsosListPage />} />
        <Route path="/asos/new" element={<AsoFormPage />} />
        <Route path="/asos/:id/edit" element={<AsoFormPage />} />
        <Route path="/occurrences" element={<OccurrencesListPage />} />
        <Route path="/occurrences/new" element={<OccurrenceFormPage />} />
        <Route path="/occurrences/:id/edit" element={<OccurrenceFormPage />} />
        <Route path="/vehicles" element={<VehiclesListPage />} />
        <Route path="/vehicles/new" element={<VehicleFormPage />} />
        <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
        <Route path="/drivers" element={<DriversListPage />} />
        <Route path="/drivers/new" element={<DriverFormPage />} />
        <Route path="/drivers/:id/edit" element={<DriverFormPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
        toastClassName="spark-toast"
        progressClassName="spark-toast-progress"
      />
    </QueryClientProvider>
  );
}

export default App;
