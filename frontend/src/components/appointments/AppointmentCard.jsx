import { CalendarDays, Clock3, Mail, Stethoscope } from "lucide-react";
import { formatDate, getInitials } from "../../utils/formatters.js";
import StatusBadge from "../common/StatusBadge.jsx";

const AppointmentCard = ({ appointment, viewerRole = "patient", children }) => {
  const patient = appointment.patient || {};
  const doctor = appointment.doctor || {};
  const person = viewerRole === "patient" ? doctor : patient;
  const title = viewerRole === "patient" ? `Dr. ${person.name || "Doctor"}` : person.name || "Patient";
  const statusAccent = {
    pending: "border-l-warning",
    approved: "border-l-success",
    rejected: "border-l-danger",
    cancelled: "border-l-slate-300"
  }[appointment.status] || "border-l-line";

  return (
    <article className={`rounded-panel border border-line border-l-[3px] bg-white p-4 shadow-card sm:p-5 ${statusAccent}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-medical">{getInitials(person.name)}</span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
              {viewerRole === "patient" ? <Stethoscope className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
              {viewerRole === "patient" ? (doctor.specialization || "Care provider") : (person.email || "Patient")}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-canvas px-3 py-3 text-xs sm:grid-cols-3">
        <span className="flex items-center gap-2 text-ink"><CalendarDays className="h-4 w-4 text-sage-deep" />{formatDate(appointment.appointmentDate)}</span>
        <span className="flex items-center gap-2 text-ink"><Clock3 className="h-4 w-4 text-sage-deep" />{appointment.appointmentTime}</span>
        {viewerRole === "admin" && (
          <span className="col-span-2 flex items-center gap-2 truncate text-ink sm:col-span-1">
            <Stethoscope className="h-4 w-4 shrink-0 text-sage-deep" />Dr. {doctor.name || "Doctor"}
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{appointment.reason}</p>
      {children && <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">{children}</div>}
    </article>
  );
};

export default AppointmentCard;
