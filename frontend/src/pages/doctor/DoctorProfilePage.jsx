import { Award, Stethoscope } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import PageHeading from "../../components/common/PageHeading.jsx";
import { getInitials } from "../../utils/formatters.js";

const DoctorProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl soft-enter">
      <PageHeading eyebrow="Your professional profile" title="My profile" description="Review the provider details visible to patients." />
      <section className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
        <div className="bg-medical px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 font-display text-xl font-bold">{getInitials(user?.name)}</span>
            <div>
              <h2 className="font-display text-xl font-bold">Dr. {user?.name}</h2>
              <p className="mt-1 text-sm text-white/65">{user?.specialization}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <div className="rounded-xl bg-canvas p-4">
            <Stethoscope className="h-5 w-5 text-sage" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Specialization</p>
            <p className="mt-1 font-semibold text-ink">{user?.specialization || "—"}</p>
          </div>
          <div className="rounded-xl bg-canvas p-4">
            <Award className="h-5 w-5 text-sage" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Experience</p>
            <p className="mt-1 font-semibold text-ink">{user?.experience ?? "—"}{user?.experience != null ? " years" : ""}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Account email</p>
            <p className="mt-1 break-all font-semibold text-ink">{user?.email}</p>
          </div>
        </div>
        <p className="border-t border-line px-6 py-4 text-xs leading-5 text-muted sm:px-8">
          To update your professional details, please contact a clinic administrator.
        </p>
      </section>
    </div>
  );
};

export default DoctorProfilePage;
