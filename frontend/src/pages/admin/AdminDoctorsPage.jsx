import { useCallback, useState } from "react";
import { Pencil, Plus, Power, Search, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import CreateDoctorModal from "../../components/admin/CreateDoctorModal.jsx";
import UserTable from "../../components/admin/UserTable.jsx";
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
  const [editTarget, setEditTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const loadDoctors = useCallback(async () => {
    const { data } = await api.get("/admin/users", { params: { role: "doctor" } });
    return data.users;
  }, []);
  const { data: doctors, loading, error, reload } = useResource(loadDoctors);
  const filtered = (doctors || []).filter((doctor) => `${doctor.name} ${doctor.email} ${doctor.specialization}`.toLowerCase().includes(search.toLowerCase()));

  const saveDoctor = async (values) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.patch(`/admin/doctors/${editTarget._id}`, values);
        toast.success("Doctor profile updated.");
      } else {
        await api.post("/admin/doctors", values);
        toast.success("Doctor account created.");
      }
      setFormOpen(false);
      setEditTarget(null);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not save this doctor."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (doctor) => {
    setBusyId(doctor._id);
    try {
      await api.patch(`/admin/users/${doctor._id}/active`, { isActive: !doctor.isActive });
      toast.success(`Doctor account ${doctor.isActive ? "deactivated" : "activated"}.`);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update this doctor's access."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow="Provider directory"
        title="Manage doctors"
        description="Create provider accounts and keep your clinic’s care team up to date."
        action={<button type="button" className="primary-button" onClick={() => { setEditTarget(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add doctor</button>}
      />
      <div className="mb-5 max-w-lg"><SearchBar value={search} onChange={setSearch} placeholder="Search doctors by name, email or specialty" /></div>
      {loading ? <LoadingSpinner label="Loading doctors" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <UserTable
          users={filtered}
          role="doctor"
          renderActions={(doctor) => (
            <>
              <button type="button" className="icon-button h-9 w-9" onClick={() => { setEditTarget(doctor); setFormOpen(true); }} aria-label={`Edit ${doctor.name}`} title="Edit doctor"><Pencil className="h-4 w-4" /></button>
              <button type="button" className="icon-button h-9 w-9" onClick={() => toggleActive(doctor)} disabled={busyId === doctor._id} aria-label={`${doctor.isActive ? "Deactivate" : "Activate"} ${doctor.name}`} title={doctor.isActive ? "Deactivate doctor" : "Activate doctor"}><Power className={`h-4 w-4 ${doctor.isActive ? "text-success" : "text-muted"}`} /></button>
            </>
          )}
        />
      ) : (
        <EmptyState icon={Stethoscope} title={doctors?.length ? "No doctors match" : "Your provider list is empty"} description={doctors?.length ? "Try a different search." : "Create a provider account to make doctors available for patient bookings."} action={!doctors?.length ? <button type="button" className="secondary-button py-2.5" onClick={() => { setEditTarget(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add your first doctor</button> : search ? <button type="button" className="secondary-button py-2.5" onClick={() => setSearch("")}><Search className="h-4 w-4" /> Clear search</button> : null} />
      )}
      {formOpen && <CreateDoctorModal doctor={editTarget} onClose={() => !saving && setFormOpen(false)} onSubmit={saveDoctor} saving={saving} />}
    </div>
  );
};

export default AdminDoctorsPage;
