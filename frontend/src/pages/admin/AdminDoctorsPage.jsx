import { useCallback, useState } from "react";
import { Plus, Search, Stethoscope, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CreateDoctorModal from "../../components/admin/CreateDoctorModal.jsx";
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

const AdminDoctorsPage = () => {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const loadDoctors = useCallback(async () => {
    const { data } = await api.get("/admin/users", { params: { role: "doctor" } });
    return data.users;
  }, []);
  const { data: doctors, loading, error, reload } = useResource(loadDoctors);
  const filtered = (doctors || []).filter((doctor) => `${doctor.name} ${doctor.email} ${doctor.specialization}`.toLowerCase().includes(search.toLowerCase()));

  const createDoctor = async (values) => {
    setSaving(true);
    try {
      await api.post("/admin/doctors", values);
      toast.success("Doctor account created.");
      setCreateOpen(false);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not create the doctor account."));
    } finally {
      setSaving(false);
    }
  };

  const deleteDoctor = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success("Doctor account deleted.");
      setDeleteTarget(null);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not delete this doctor."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow="Provider directory"
        title="Manage doctors"
        description="Create provider accounts and keep your clinic’s care team up to date."
        action={<button type="button" className="primary-button" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add doctor</button>}
      />
      <div className="mb-5 max-w-lg"><SearchBar value={search} onChange={setSearch} placeholder="Search doctors by name, email or specialty" /></div>
      {loading ? <LoadingSpinner label="Loading doctors" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <UserTable
          users={filtered}
          role="doctor"
          renderActions={(doctor) => (
            <button type="button" className="icon-button h-9 w-9 border-0 text-danger hover:bg-[#FCECEC]" onClick={() => setDeleteTarget(doctor)} aria-label={`Delete ${doctor.name}`}><Trash2 className="h-4 w-4" /></button>
          )}
        />
      ) : (
        <EmptyState icon={Stethoscope} title={doctors?.length ? "No doctors match" : "Your provider list is empty"} description={doctors?.length ? "Try a different search." : "Create a provider account to make doctors available for patient bookings."} action={!doctors?.length ? <button type="button" className="secondary-button py-2.5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add your first doctor</button> : search ? <button type="button" className="secondary-button py-2.5" onClick={() => setSearch("")}><Search className="h-4 w-4" /> Clear search</button> : null} />
      )}
      {createOpen && <CreateDoctorModal onClose={() => !saving && setCreateOpen(false)} onSubmit={createDoctor} saving={saving} />}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete this doctor?"
        description={`${deleteTarget?.name || "This provider"} will no longer be able to sign in or receive appointments. This action cannot be undone.`}
        confirmLabel="Delete doctor"
        danger
        loading={deleting}
        onConfirm={deleteDoctor}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminDoctorsPage;
