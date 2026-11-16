import { Inbox } from "lucide-react";

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-line bg-white/70 px-6 py-12 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-medical">
      <Icon className="h-5 w-5" />
    </span>
    <h3 className="font-display text-base font-bold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
