import { useCallback } from "react";
import { ArrowRight, CalendarDays, Stethoscope, Users } from "lucide-react";
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const loadOverview = useCallback(async () => {
    const [statsResponse, appointmentsResponse] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/appointments")
    ]);
    return {
      stats: statsResponse.data.stats,
      appointments: appointmentsResponse.data.appointments
    };
  }, []);
  const { data, loading, error, reload } = useResource(loadOverview);

  if (loading) return <LoadingSpinner fullPage label="Loading clinic overview" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  const stats = data.stats;
  const recent = [...data.appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Clinic operations" title={`Welcome, ${user?.name?.trim().split(/\s+/)[0] || "Administrator"}`} description="A clear overview of your clinic and its appointment activity." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total patients" value={stats.totalPatients} note="Registered patient accounts" icon={Users} tone="blue" />
        <StatCard label="Total doctors" value={stats.totalDoctors} note="Provider accounts" icon={Stethoscope} tone="sage" />
        <StatCard label="Total appointments" value={stats.totalAppointments} note="All appointment records" icon={CalendarDays} tone="gold" />
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sage-deep">Clinic activity</p>
            <h2 className="mt-1 font-display text-lg font-bold text-ink">Recently booked appointments</h2>
          </div>
          <Link to="/admin/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-medical transition hover:text-sage-deep">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {recent.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {recent.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} viewerRole="admin" />)}
          </div>
        ) : (
          <EmptyState icon={CalendarDays} title="No appointments yet" description="Appointment activity will appear here when patients book their first visit." />
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
