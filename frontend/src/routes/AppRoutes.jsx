import { Link, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute, { PublicOnlyRoute } from "../components/common/ProtectedRoute.jsx";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import AuthPage from "../pages/auth/AuthPage.jsx";
import AdminAppointmentsPage from "../pages/admin/AdminAppointmentsPage.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminDoctorsPage from "../pages/admin/AdminDoctorsPage.jsx";
import AdminPatientsPage from "../pages/admin/AdminPatientsPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage.jsx";
import BookAppointmentPage from "../pages/patient/BookAppointmentPage.jsx";
import DoctorsPage from "../pages/patient/DoctorsPage.jsx";
import PatientAppointmentsPage from "../pages/patient/PatientAppointmentsPage.jsx";
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import PatientProfilePage from "../pages/patient/PatientProfilePage.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getRoleHome } from "../utils/formatters.js";

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? getRoleHome(user.role) : "/login"} replace />;
};

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 text-center">
    <p className="font-display text-6xl font-extrabold text-medical">404</p>
    <h1 className="mt-3 font-display text-xl font-bold text-ink">This page isn’t in your care plan</h1>
    <p className="mt-2 text-sm text-muted">The page may have moved or the link may be incorrect.</p>
    <Link to="/" className="primary-button mt-6">Back to ClinicFlow</Link>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
      <Route path="/patient" element={<DashboardLayout role="patient" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="book" element={<BookAppointmentPage />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
      <Route path="/doctor" element={<DashboardLayout role="doctor" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="requests" element={<DoctorAppointmentsPage requestsOnly />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
