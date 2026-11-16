import { useCallback } from "react";
import { ArrowRight, CalendarCheck2, CalendarClock, CalendarDays, ClipboardCheck } from "lucide-react";
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

const DoctorDashboard = () => {
  const { user } = useAuth();
  const loadAppointments = useCallback(async () => {
    const { data } = await api.get("/appointments/doctor");
    return data.appointments;
  }, []);
  const { data: appointments, loading, error, reload } = useResource(loadAppointments);

  if (loading) return <LoadingSpinner fullPage label="Loading your practice overview" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  const items = appointments || [];
  const pending = items.filter((item) => item.status === "pending").length;
  const approved = items.filter((item) => item.status === "approved").length;
  const rejected = items.filter((item) => item.status === "rejected").length;
  const requests = items.filter((item) => item.status === "pending").slice(0, 3);

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow={user?.specialization || "Care provider"}
        title={`Good day, Dr. ${user?.name?.trim().split(/\s+/)[0] || ""}`}
        description="A clear view of your schedule and the people who need your care."
        action={<Link to="/doctor/requests" className="primary-button"><ClipboardCheck className="h-4 w-4" /> Review requests{pending ? ` · ${pending}` : ""}</Link>}
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total appointments" value={items.length} note="All appointment requests" icon={CalendarDays} tone="blue" />
        <StatCard label="Pending requests" value={pending} note="Need your review" icon={CalendarClock} tone="gold" />
        <StatCard label="Approved visits" value={approved} note="Confirmed with patients" icon={CalendarCheck2} tone="sage" />
        <StatCard label="Rejected requests" value={rejected} note="Requests not accepted" icon={ClipboardCheck} tone="red" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sage-deep">Needs your attention</p>
            <h2 className="mt-1 font-display text-lg font-bold text-ink">New appointment requests</h2>
          </div>
          <Link to="/doctor/requests" className="inline-flex items-center gap-1 text-xs font-bold text-medical transition hover:text-sage-deep">View requests <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {requests.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {requests.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="doctor" />)}
          </div>
        ) : (
          <EmptyState icon={CalendarCheck2} title="You're all caught up" description="New patient requests will appear here as soon as they're received." />
        )}
      </section>
    </div>
  );
};

export default DoctorDashboard;
