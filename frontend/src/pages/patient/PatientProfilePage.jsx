import { useAuth } from "../../hooks/useAuth.js";
import { getInitials } from "../../utils/formatters.js";
import PageHeading from "../../components/common/PageHeading.jsx";

const PatientProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl soft-enter">
      <PageHeading eyebrow="Your account" title="My profile" description="Your personal account details used to manage your clinic visits." />
      <section className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
        <div className="bg-medical px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 font-display text-xl font-bold">{getInitials(user?.name)}</span>
            <div>
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="mt-1 text-sm capitalize text-white/65">{user?.role} account</p>
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-2">
          <div className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Full name</p>
            <p className="mt-2 font-semibold text-ink">{user?.name}</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email address</p>
            <p className="mt-2 break-all font-semibold text-ink">{user?.email}</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Account type</p>
            <p className="mt-2 font-semibold capitalize text-ink">{user?.role}</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Account status</p>
            <p className={`mt-2 inline-flex items-center gap-2 font-semibold ${user?.isActive ? "text-success" : "text-muted"}`}><span className={`h-2 w-2 rounded-full ${user?.isActive ? "bg-success" : "bg-slate-400"}`} /> {user?.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>
        <p className="border-t border-line px-6 py-4 text-xs leading-5 text-muted sm:px-8">
          For changes to your personal details, please contact your clinic administrator.
        </p>
      </section>
    </div>
  );
};

export default PatientProfilePage;
