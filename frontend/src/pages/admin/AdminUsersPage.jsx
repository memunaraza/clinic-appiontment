import { useCallback, useState } from "react";
import { Search, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import UserTable from "../../components/admin/UserTable.jsx";
import ConfirmationModal from "../../components/common/ConfirmationModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError } from "../../utils/formatters.js";

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState("");
  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/admin/users");
    return data.users;
  }, []);
  const { data: users, loading, error, reload } = useResource(loadUsers);
  const filtered = (users || []).filter((item) => {
    const matchesText = `${item.name} ${item.email} ${item.specialization || ""} ${item.role}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role === "all" || item.role === role;
    const matchesStatus = status === "all" || (status === "active" ? item.isActive : !item.isActive);
    return matchesText && matchesRole && matchesStatus;
  });

  const toggleActive = async (item) => {
    setBusyId(item._id);
    try {
      await api.patch(`/admin/users/${item._id}/active`, { isActive: !item.isActive });
      toast.success(`Account ${item.isActive ? "deactivated" : "activated"}.`);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update this account."));
    } finally {
      setBusyId("");
    }
  };

  const deleteUser = async () => {
    if (!selected) return;
    setBusyId(selected._id);
    try {
      await api.delete(`/admin/users/${selected._id}`);
      toast.success("User account deleted.");
      setSelected(null);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not delete this account."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Access and accounts" title="Manage users" description="Search across patient and provider accounts, update access, and remove accounts when needed." />
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_170px_170px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email or specialty" />
        <select className="field-control" value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by account role">
          <option value="all">All roles</option><option value="patient">Patients</option><option value="doctor">Doctors</option><option value="admin">Admins</option>
        </select>
        <select className="field-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by account status">
          <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>
      {loading ? <LoadingSpinner label="Loading user accounts" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <UserTable
          users={filtered}
          role="all"
          renderActions={(item) => item.role === "admin" ? (
            <span className="px-2 py-2 text-xs text-muted">Admin access</span>
          ) : (
            <>
              <button type="button" className="secondary-button py-2 text-xs" onClick={() => toggleActive(item)} disabled={busyId === item._id}>
                {busyId === item._id ? "Updating…" : item.isActive ? "Deactivate" : "Activate"}
              </button>
              <button type="button" className="icon-button h-9 w-9 border-0 text-danger hover:bg-[#FCECEC]" onClick={() => setSelected(item)} aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button>
            </>
          )}
        />
      ) : (
        <EmptyState icon={search || role !== "all" || status !== "all" ? Search : Users} title={users?.length ? "No accounts match" : "No users found"} description={users?.length ? "Try a different search or filter." : "Clinic accounts will appear here as users register."} action={users?.length && (search || role !== "all" || status !== "all") ? <button type="button" className="secondary-button py-2.5" onClick={() => { setSearch(""); setRole("all"); setStatus("all"); }}>Clear filters</button> : null} />
      )}
      <ConfirmationModal
        open={Boolean(selected)}
        title="Delete this account?"
        description={`The ${selected?.role || "user"} account for ${selected?.name || "this person"} will be removed. This action cannot be undone.`}
        confirmLabel="Delete account"
        danger
        loading={busyId === selected?._id}
        onConfirm={deleteUser}
        onClose={() => !busyId && setSelected(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
