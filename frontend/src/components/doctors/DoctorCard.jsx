import { ArrowUpRight, CalendarPlus, Stethoscope } from "lucide-react";
import { getInitials } from "../../utils/formatters.js";

const DoctorCard = ({ doctor, onView, onBook }) => (
  <article className="group rounded-panel border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:p-6">
    <div className="flex items-start justify-between">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-display text-base font-extrabold text-medical">
        {getInitials(doctor.name)}
      </div>
      <span className="rounded-full bg-[#E7F5EF] px-2.5 py-1 text-[11px] font-semibold text-success">Active provider</span>
    </div>
    <div className="mt-4">
      <h3 className="font-display text-lg font-bold text-ink">Dr. {doctor.name}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-sage-deep">
        <Stethoscope className="h-3.5 w-3.5" />
        {doctor.specialization || "General practice"}
      </p>
    </div>
    <p className="mt-3 text-sm text-muted">{Number(doctor.experience) || 0} years of experience</p>
    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4">
      <button type="button" className="secondary-button py-2.5 text-xs" onClick={() => onView(doctor)}>
        Details <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="primary-button py-2.5 text-xs" onClick={() => onBook(doctor)}>
        <CalendarPlus className="h-3.5 w-3.5" /> Book
      </button>
    </div>
  </article>
);

export default DoctorCard;
