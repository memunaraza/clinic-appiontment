import { useCallback, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import toast from "react-hot-toast";
import AppointmentCard from "../../components/appointments/AppointmentCard.jsx";
import ConfirmationModal from "../../components/common/ConfirmationModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError } from "../../utils/formatters.js";

const PatientAppointmentsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const loadAppointments = useCallback(async () => {
    const { data } = await api.get("/appointments/my");
    return data.appointments;
  }, []);
  const { data: appointments, loading, error, reload } = useResource(loadAppointments);

  const filtered = (appointments || []).filter((appointment) => {
    const doctor = appointment.doctor || {};
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch = !search || `${doctor.name} ${doctor.specialization} ${appointment.reason}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const confirmCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${selected._id}/cancel`);
      toast.success("Appointment cancelled.");
      setSelected(null);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not cancel this appointment."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Your care plan" title="My appointments" description="Keep track of requests, confirmed visits, and past appointments." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_190px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search doctor or reason" />
        <select className="field-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter appointments by status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <LoadingSpinner label="Loading your appointments" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {filtered.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="patient">
              {appointment.status === "pending" && (
                <button type="button" className="secondary-button py-2 text-xs text-danger hover:border-danger hover:bg-[#FCECEC]" onClick={() => setSelected(appointment)}>
                  Cancel request
                </button>
              )}
            </AppointmentCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={search || statusFilter !== "all" ? Search : CalendarDays}
          title={appointments?.length ? "No appointments match" : "No appointments yet"}
          description={appointments?.length ? "Try a different search or status filter." : "Once you book with a doctor, your appointments will appear here."}
        />
      )}
      <ConfirmationModal
        open={Boolean(selected)}
        title="Cancel this appointment?"
        description="This request will be cancelled and its time slot will become available again."
        confirmLabel="Cancel appointment"
        danger
        loading={cancelling}
        onConfirm={confirmCancel}
        onClose={() => !cancelling && setSelected(null)}
      />
    </div>
  );
};

export default PatientAppointmentsPage;
