import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  danger = false,
  loading = false,
  onConfirm,
  onClose
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-medical/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && !loading && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-lift soft-enter">
        <div className="flex items-start justify-between">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${danger ? "bg-[#FCECEC] text-danger" : "bg-accent text-medical"}`}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <button type="button" className="icon-button h-8 w-8 border-0" onClick={onClose} disabled={loading} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 id="confirm-title" className="mt-4 font-display text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="secondary-button py-2.5" onClick={onClose} disabled={loading}>{cancelLabel}</button>
          <button type="button" className={`primary-button py-2.5 ${danger ? "bg-danger hover:bg-[#ca4e4e] focus:ring-danger/20" : ""}`} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
