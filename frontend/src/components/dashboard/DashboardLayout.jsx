import { useState } from "react";
import toast from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getRoleHome } from "../../utils/formatters.js";
import ConfirmationModal from "../common/ConfirmationModal.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    toast.success("You have signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        role={role}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setLogoutConfirmOpen(true)}
      />
      <div className="min-h-screen md:pl-[268px]">
        <Navbar role={role} user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <Outlet context={{ user, home: getRoleHome(role) }} />
        </main>
      </div>
      <ConfirmationModal
        open={logoutConfirmOpen}
        title="Sign out of ClinicFlow?"
        description="You will need to sign in again to access your clinic account."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={handleLogout}
        onClose={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
