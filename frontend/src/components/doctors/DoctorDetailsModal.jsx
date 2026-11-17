import { useEffect, useState } from "react";
import { Award, CalendarPlus, LoaderCircle, Stethoscope, X } from "lucide-react";
import api from "../../services/api.js";
import { getDisplayError, getInitials } from "../../utils/formatters.js";

const DoctorDetailsModal = ({ doctor, onClose, onBook }) => {
  const [detail, setDetail] = useState(doctor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/doctors/${doctor._id}`)
      .then(({ data }) => { if (active) setDetail(data.doctor); })
      .catch((requestError) => { if (active) setError(getDisplayError(requestError, "Could not load doctor details.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor._id]);

  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-medical/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="doctor-detail-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-lift soft-enter">
        <div className="relative bg-medical px-6 pb-7 pt-6 text-white">
          <button type="button" className="absolute right-4 top-4 rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close doctor details">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4 pr-8">
            {detail.profilePicture
              ? <img src={detail.profilePicture} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-display text-xl font-bold">{getInitials(detail.name)}</div>}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Care provider</p>
              <h2 id="doctor-detail-title" className="mt-1 truncate font-display text-xl font-bold">Dr. {detail.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75"><Stethoscope className="h-4 w-4" />{detail.specialization}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted"><LoaderCircle className="h-4 w-4 animate-spin" />Loading profile…</div>
          ) : error ? (
            <p className="rounded-xl bg-[#FCECEC] p-4 text-sm text-danger">{error}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-canvas p-4">
                <Award className="h-5 w-5 text-sage" />
                <p className="mt-3 font-display text-xl font-bold text-ink">{detail.experience} years</p>
                <p className="text-xs text-muted">Clinical experience</p>
              </div>
              <div className="rounded-xl bg-canvas p-4">
                <Stethoscope className="h-5 w-5 text-sage" />
                <p className="mt-3 truncate text-sm font-semibold text-ink">{detail.specialization}</p>
                <p className="text-xs text-muted">Specialty</p>
              </div>
              <div className="rounded-xl bg-canvas p-4">
                <Award className="h-5 w-5 text-sage" />
                <p className="mt-3 truncate text-sm font-semibold text-ink">{detail.qualification || "Qualification not provided"}</p>
                <p className="text-xs text-muted">Qualification</p>
              </div>
              <div className="rounded-xl bg-canvas p-4">
                <p className="font-display text-xl font-bold text-ink">{detail.consultationFee != null ? `Fee ${detail.consultationFee}` : "Fee not set"}</p>
                <p className="text-xs text-muted">Consultation fee</p>
              </div>
            </div>
          )}
          {!loading && !error && detail.biography && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted">{detail.biography}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="secondary-button" onClick={onClose}>Close</button>
            <button type="button" className="primary-button" disabled={loading || Boolean(error)} onClick={() => onBook(detail)}>
              <CalendarPlus className="h-4 w-4" /> Book appointment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorDetailsModal;
