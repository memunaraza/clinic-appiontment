const statusStyles = {
  pending: "bg-[#FFF5E7] text-[#A36C16]",
  approved: "bg-[#E7F5EF] text-[#26845E]",
  rejected: "bg-[#FCECEC] text-[#C94B4B]",
  cancelled: "bg-slate-100 text-slate-500"
};

const StatusBadge = ({ status }) => {
  const label = status ? `${status[0].toUpperCase()}${status.slice(1)}` : "Unknown";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "pending" ? "bg-warning" : status === "approved" ? "bg-success" : status === "rejected" ? "bg-danger" : "bg-slate-400"}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
