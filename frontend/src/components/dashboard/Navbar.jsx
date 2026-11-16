import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navigationByRole } from "../../utils/navigation.js";
import { getInitials } from "../../utils/formatters.js";

const Navbar = ({ role, user, onMenuClick }) => {
  const { pathname } = useLocation();
  const links = navigationByRole[role] || [];
  const currentPage = links.find((item) => item.to === pathname)?.label || "Overview";
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="icon-button h-9 w-9 md:hidden" onClick={onMenuClick} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="hidden sm:inline">Workspace</span>
              <span className="hidden sm:inline">/</span>
              <span className="truncate font-semibold text-medical">{currentPage}</span>
            </div>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">Good day, {firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 border-l border-line pl-3 sm:gap-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="max-w-32 truncate text-xs font-bold text-ink">{user?.name}</p>
              <p className="text-[11px] capitalize text-muted">{role}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-medical ring-2 ring-white">
              {getInitials(user?.name)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
