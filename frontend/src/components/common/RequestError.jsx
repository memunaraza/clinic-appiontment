import { AlertCircle, RefreshCw } from "lucide-react";

const RequestError = ({ message, onRetry }) => (
  <div className="flex flex-col items-center rounded-panel border border-[#F3D0D0] bg-white px-6 py-10 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FCECEC] text-danger"><AlertCircle className="h-5 w-5" /></span>
    <h3 className="mt-3 font-semibold text-ink">We couldn’t load this right now</h3>
    <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
    {onRetry && <button type="button" className="secondary-button mt-5 py-2.5" onClick={onRetry}><RefreshCw className="h-4 w-4" /> Try again</button>}
  </div>
);

export default RequestError;
