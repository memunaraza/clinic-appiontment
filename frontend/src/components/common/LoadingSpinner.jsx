import { LoaderCircle } from "lucide-react";

const LoadingSpinner = ({ label = "Loading", fullPage = false }) => (
  <div className={`flex items-center justify-center gap-3 text-sm text-muted ${fullPage ? "min-h-[55vh]" : "py-12"}`} role="status">
    <LoaderCircle className="h-5 w-5 animate-spin text-sage" />
    <span>{label}…</span>
  </div>
);

export default LoadingSpinner;
