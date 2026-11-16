import { useCallback } from "react";
import { ArrowRight, CalendarCheck2, CalendarClock, CalendarDays, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import AppointmentCard from "../../components/appointments/AppointmentCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";

const PatientDashboard = () => {
  const { user } = useAuth();
  const loadOverview = useCallback(async () => {
    const [appointmentResponse, doctorResponse] = await Promise.all([
      api.get("/appointments/my"),
      api.get("/doctors")
    ]);
    return {
      appointments: appointmentResponse.data.appointments,
      doctors: doctorResponse.data.doctors
    };
  }, []);
  const { data, loading, error, reload } = useResource(loadOverview);

  if (loading) return <LoadingSpinner fullPage label="Loading your care overview" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  const appointments = data?.appointments || [];
  const doctors = data?.doctors || [];
  const pending = appointments.filter((item) => item.status === "pending").length;
  const approved = appointments.filter((item) => item.status === "approved").length;
  const recent = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow="Your health, at a glance"
        title={`Good to see you, ${user?.name?.trim().split(/\s+/)[0] || "there"}`}
        description="Here’s what’s happening with your care today."
        action={<Link to="/patient/book" className="primary-button"><CalendarDays className="h-4 w-4" /> Book a visit</Link>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total appointments" value={appointments.length} note="Across your care journey" icon={CalendarDays} tone="blue" />
        <StatCard label="Awaiting confirmation" value={pending} note="Your care team will respond soon" icon={CalendarClock} tone="gold" />
        <StatCard label="Confirmed visits" value={approved} note="Appointments approved by your doctor" icon={CalendarCheck2} tone="sage" />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sage-deep">Your care plan</p>
              <h2 className="mt-1 font-display text-lg font-bold text-ink">Recently booked</h2>
            </div>
            <Link to="/patient/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-medical transition hover:text-sage-deep">
              All appointments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length ? (
            <div className="space-y-3">
              {recent.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="patient" />)}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Your next step starts here"
              description="You haven't booked an appointment yet. Find a provider and make your first visit."
              action={<Link className="secondary-button py-2.5" to="/patient/doctors"><Stethoscope className="h-4 w-4" /> Find a doctor</Link>}
            />
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sage-deep">Care team</p>
              <h2 className="mt-1 font-display text-lg font-bold text-ink">Available doctors</h2>
            </div>
            <Link to="/patient/doctors" className="inline-flex items-center gap-1 text-xs font-bold text-medical transition hover:text-sage-deep">
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {doctors.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {doctors.slice(0, 2).map((doctor) => (
                <div key={doctor._id} className="rounded-panel border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">Dr. {doctor.name}</p>
                      <p className="mt-1 truncate text-xs text-muted">{doctor.specialization} · {doctor.experience} yrs</p>
                    </div>
                    <Link to={`/patient/book?doctorId=${doctor._id}`} className="icon-button h-9 w-9 shrink-0 border-0 bg-accent text-medical" aria-label={`Book with Dr. ${doctor.name}`}><CalendarDays className="h-4 w-4" /></Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Stethoscope} title="No doctors available" description="There are no active providers to display right now." />
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
