import { Activity, ChevronRight, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationByRole } from "../../utils/navigation.js";
import { getInitials } from "../../utils/formatters.js";

const Sidebar = ({ role, user, open, onClose, onLogout }) => {
  const links = navigationByRole[role] || [];

  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-medical/35 md:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col bg-medical text-white transition-transform duration-300 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-medical">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight">ClinicFlow</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Care, made simpler</p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-2 text-white/65 hover:bg-white/10 hover:text-white md:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-3 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Workspace</p>
          <nav className="mt-3 space-y-1">
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-accent text-medical shadow-sm" : "text-white/70 hover:bg-white/[0.08] hover:text-white"}`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-[.active]:opacity-70" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.07] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6E7E1] text-xs font-bold text-medical">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs capitalize text-white/55">{role} account</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
