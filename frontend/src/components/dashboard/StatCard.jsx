const StatCard = ({ label, value, note, icon: Icon, tone = "sage" }) => {
  const tones = {
    sage: { icon: "bg-accent text-sage-deep", accent: "bg-sage" },
    blue: { icon: "bg-[#EAF1F6] text-medical", accent: "bg-medical" },
    gold: { icon: "bg-[#FFF5E7] text-[#A36C16]", accent: "bg-warning" },
    red: { icon: "bg-[#FCECEC] text-danger", accent: "bg-danger" }
  };
  const colors = tones[tone] || tones.sage;

  return (
    <article className="relative overflow-hidden rounded-panel border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:p-6">
      <span className={`absolute inset-y-0 left-0 w-1 ${colors.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">{value}</p>
          {note && <p className="mt-1 text-xs text-muted">{note}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
};

export default StatCard;
