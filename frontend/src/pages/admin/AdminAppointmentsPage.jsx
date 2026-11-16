import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import AppointmentTable from "../../components/appointments/AppointmentTable.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";

const AdminAppointmentsPage = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const loadAppointments = useCallback(async () => {
    const { data } = await api.get("/admin/appointments");
    return data.appointments;
  }, []);
  const { data: appointments, loading, error, reload } = useResource(loadAppointments);
  const filtered = useMemo(() => (appointments || []).filter((appointment) => {
    const patient = appointment.patient || {};
    const doctor = appointment.doctor || {};
    const matchesStatus = status === "all" || appointment.status === status;
    const matchesSearch = !search || `${patient.name} ${patient.email} ${doctor.name} ${doctor.specialization} ${appointment.reason}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [appointments, status, search]);

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Clinic schedule" title="All appointments" description="Search and review every patient visit across the clinic." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_190px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patient, doctor or reason" />
        <select className="field-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter appointments by status">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <LoadingSpinner label="Loading clinic appointments" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <AppointmentTable appointments={filtered} />
      ) : (
        <EmptyState icon={appointments?.length ? Search : CalendarDays} title={appointments?.length ? "No appointments match" : "No appointments yet"} description={appointments?.length ? "Try another search or status filter." : "Patient bookings will appear here."} action={appointments?.length && (search || status !== "all") ? <button type="button" className="secondary-button py-2.5" onClick={() => { setSearch(""); setStatus("all"); }}>Clear filters</button> : null} />
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
