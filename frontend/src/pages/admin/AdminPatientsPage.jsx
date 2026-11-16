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

const AdminPatientsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState("");
  const loadPatients = useCallback(async () => {
    const { data } = await api.get("/admin/users", { params: { role: "patient" } });
    return data.users;
  }, []);
  const { data: patients, loading, error, reload } = useResource(loadPatients);
  const filtered = (patients || []).filter((patient) => {
    const matchesText = `${patient.name} ${patient.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "all" || (filter === "active" ? patient.isActive : !patient.isActive);
    return matchesText && matchesStatus;
  });

  const toggleActive = async (patient) => {
    setBusyId(patient._id);
    try {
      await api.patch(`/admin/users/${patient._id}/active`, { isActive: !patient.isActive });
      toast.success(`Patient account ${patient.isActive ? "deactivated" : "activated"}.`);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update this account."));
    } finally {
      setBusyId("");
    }
  };

  const deletePatient = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success("Patient account deleted.");
      setDeleteTarget(null);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not delete this patient."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Patient directory" title="Manage patients" description="Review patient accounts and manage access to the clinic." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name or email" />
        <select className="field-control" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter patient status">
          <option value="all">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>
      {loading ? <LoadingSpinner label="Loading patients" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <UserTable
          users={filtered}
          role="patient"
          renderActions={(patient) => (
            <>
              <button type="button" className="secondary-button py-2 text-xs" onClick={() => toggleActive(patient)} disabled={busyId === patient._id}>
                {busyId === patient._id ? "Updating…" : patient.isActive ? "Deactivate" : "Activate"}
              </button>
              <button type="button" className="icon-button h-9 w-9 border-0 text-danger hover:bg-[#FCECEC]" onClick={() => setDeleteTarget(patient)} aria-label={`Delete ${patient.name}`}><Trash2 className="h-4 w-4" /></button>
            </>
          )}
        />
      ) : (
        <EmptyState icon={search || filter !== "all" ? Search : Users} title={patients?.length ? "No patients match" : "No patients registered"} description={patients?.length ? "Try a different search or status filter." : "Patients who register through the sign-up page will appear here."} action={patients?.length && (search || filter !== "all") ? <button type="button" className="secondary-button py-2.5" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</button> : null} />
      )}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete this patient?"
        description={`The account for ${deleteTarget?.name || "this patient"} will be removed. This action cannot be undone.`}
        confirmLabel="Delete patient"
        danger
        loading={busyId === deleteTarget?._id}
        onConfirm={deletePatient}
        onClose={() => !busyId && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPatientsPage;
