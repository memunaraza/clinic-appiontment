import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Check, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import AppointmentCard from "../../components/appointments/AppointmentCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError } from "../../utils/formatters.js";

const DoctorAppointmentsPage = ({ requestsOnly = false }) => {
  const [statusFilter, setStatusFilter] = useState(requestsOnly ? "pending" : "all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const loadAppointments = useCallback(async () => {
    const { data } = await api.get("/appointments/doctor");
    return data.appointments;
  }, []);
  const { data: appointments, loading, error, reload } = useResource(loadAppointments);

  const filtered = useMemo(() => (appointments || []).filter((appointment) => {
    const patient = appointment.patient || {};
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch = !search || `${patient.name} ${patient.email} ${appointment.reason}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [appointments, statusFilter, search]);

  const updateStatus = async (appointment, status) => {
    setUpdatingId(appointment._id);
    try {
      await api.patch(`/appointments/${appointment._id}/status`, { status });
      toast.success(`Appointment ${status}.`);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update this appointment."));
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow={requestsOnly ? "Your inbox" : "Practice schedule"}
        title={requestsOnly ? "Appointment requests" : "All appointments"}
        description={requestsOnly ? "Review patient requests and respond when you're ready." : "Review and filter appointments assigned to your account."}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_190px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patient or reason" />
        <select className="field-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter appointments by status">
          {!requestsOnly && <option value="all">All statuses</option>}
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {loading ? <LoadingSpinner label="Loading assigned appointments" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {filtered.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="doctor">
              {appointment.status === "pending" && (
                <>
                  <button type="button" className="secondary-button py-2 text-xs text-danger hover:border-danger hover:bg-[#FCECEC]" onClick={() => updateStatus(appointment, "rejected")} disabled={updatingId === appointment._id}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button type="button" className="primary-button py-2 text-xs" onClick={() => updateStatus(appointment, "approved")} disabled={updatingId === appointment._id}>
                    {updatingId === appointment._id ? "Updating…" : <><Check className="h-3.5 w-3.5" /> Approve</>}
                  </button>
                </>
              )}
              {appointment.status === "approved" && !requestsOnly && (
                <button type="button" className="primary-button py-2 text-xs" onClick={() => updateStatus(appointment, "completed")} disabled={updatingId === appointment._id}>
                  {updatingId === appointment._id ? "Updating…" : <><Check className="h-3.5 w-3.5" /> Mark complete</>}
                </button>
              )}
            </AppointmentCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={requestsOnly ? Search : CalendarDays}
          title={requestsOnly && statusFilter === "pending" && !search ? "No new requests" : appointments?.length ? "No appointments match" : requestsOnly ? "No new requests" : "No appointments yet"}
          description={requestsOnly && statusFilter === "pending" && !search ? "New patient requests will appear here." : appointments?.length ? "Try changing the status filter or search terms." : requestsOnly ? "New patient requests will appear here." : "Appointments assigned to your practice will appear here."}
        />
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
