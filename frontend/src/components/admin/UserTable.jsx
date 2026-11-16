import { getInitials } from "../../utils/formatters.js";

const UserTable = ({ users, role, renderActions }) => (
  <>
    <div className="hidden overflow-hidden rounded-panel border border-line bg-white shadow-card md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              {(role === "doctor" || role === "all") && <th className="px-5 py-4 font-semibold">Role / specialty</th>}
              {(role === "doctor" || role === "all") && <th className="px-5 py-4 font-semibold">Experience</th>}
              <th className="px-5 py-4 font-semibold">Status</th>
              {renderActions && <th className="px-5 py-4 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user._id} className="transition hover:bg-canvas/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-medical">{getInitials(user.name)}</span>
                    <span className="font-semibold text-ink">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">{user.email}</td>
                {(role === "doctor" || role === "all") && <td className="px-5 py-4 capitalize text-ink">{user.specialization || user.role}</td>}
                {(role === "doctor" || role === "all") && <td className="px-5 py-4 text-muted">{user.experience == null ? "—" : `${user.experience} years`}</td>}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-[#E7F5EF] text-success" : "bg-slate-100 text-slate-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-success" : "bg-slate-400"}`} />
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {renderActions && <td className="px-5 py-4"><div className="flex justify-end gap-2">{renderActions(user)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="space-y-3 md:hidden">
      {users.map((user) => (
        <article key={user._id} className="rounded-panel border border-line bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-medical">{getInitials(user.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{user.name}</p>
              <p className="break-all text-xs text-muted">{user.email}</p>
              {(role === "doctor" || role === "all") && <p className="mt-1 text-xs text-muted">{user.specialization || user.role}{user.experience != null ? ` · ${user.experience} yrs` : ""}</p>}
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${user.isActive ? "bg-[#E7F5EF] text-success" : "bg-slate-100 text-slate-500"}`}>{user.isActive ? "Active" : "Inactive"}</span>
          </div>
          {renderActions && <div className="mt-3 flex justify-end gap-2 border-t border-line pt-3">{renderActions(user)}</div>}
        </article>
      ))}
    </div>
  </>
);

export default UserTable;
