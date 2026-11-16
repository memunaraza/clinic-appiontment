import { formatDate } from "../../utils/formatters.js";
import StatusBadge from "../common/StatusBadge.jsx";

const AppointmentTable = ({ appointments }) => (
  <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-5 py-4 font-semibold">Patient</th>
            <th className="px-5 py-4 font-semibold">Doctor</th>
            <th className="px-5 py-4 font-semibold">Date &amp; time</th>
            <th className="px-5 py-4 font-semibold">Reason</th>
            <th className="px-5 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {appointments.map((appointment) => (
            <tr key={appointment._id} className="transition hover:bg-canvas/70">
              <td className="px-5 py-4">
                <p className="font-semibold text-ink">{appointment.patient?.name || "—"}</p>
                <p className="mt-0.5 text-xs text-muted">{appointment.patient?.email || ""}</p>
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold text-ink">Dr. {appointment.doctor?.name || "—"}</p>
                <p className="mt-0.5 text-xs text-muted">{appointment.doctor?.specialization || ""}</p>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <p className="text-ink">{formatDate(appointment.appointmentDate)}</p>
                <p className="mt-0.5 text-xs text-muted">{appointment.appointmentTime}</p>
              </td>
              <td className="max-w-[220px] truncate px-5 py-4 text-muted" title={appointment.reason}>{appointment.reason}</td>
              <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AppointmentTable;
