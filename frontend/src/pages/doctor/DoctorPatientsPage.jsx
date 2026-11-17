import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Mail, Search, Users } from "lucide-react";
import AppointmentCard from "../../components/appointments/AppointmentCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getInitials } from "../../utils/formatters.js";

const DoctorPatientsPage = () => {
  const [search, setSearch] = useState("");
  const loadPatients = useCallback(async () => {
    const { data } = await api.get("/doctors/me/patients");
    return data.patients;
  }, []);
  const { data: patients, loading, error, reload } = useResource(loadPatients);
  const filtered = useMemo(() => (patients || []).filter((patient) =>
    `${patient.name} ${patient.email}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [patients, search]);

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Your care relationships" title="My patients" description="Patient details and visit history from appointments assigned to you." />
      <div className="mb-5 max-w-lg"><SearchBar value={search} onChange={setSearch} placeholder="Search patient name or email" /></div>
      {loading ? <LoadingSpinner label="Loading your patients" /> : error ? <RequestError message={error} onRetry={reload} /> : filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((patient) => (
            <section key={patient._id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-medical">
                  {getInitials(patient.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-ink">{patient.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted"><Mail className="h-3.5 w-3.5" />{patient.email}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-medical">
                  <CalendarDays className="h-3.5 w-3.5" />{patient.appointments.length} visits
                </span>
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                {patient.appointments.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="doctor" />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={search ? Search : Users}
          title={patients?.length ? "No patients match" : "No patient visits yet"}
          description={patients?.length ? "Try another search." : "Patients will appear here after an appointment has been assigned to you."}
          action={search && <button type="button" className="secondary-button py-2.5" onClick={() => setSearch("")}>Clear search</button>}
        />
      )}
    </div>
  );
};

export default DoctorPatientsPage;
