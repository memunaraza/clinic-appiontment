import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../../services/api.js";
import { getDisplayError } from "../../utils/formatters.js";

const ReviewModal = ({ appointment, onClose, onSubmitted }) => {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(`/appointments/${appointment._id}/review`, { rating: Number(rating), comment: comment.trim() });
      onSubmitted();
    } catch (requestError) {
      setError(getDisplayError(requestError, "Could not submit your review."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-medical/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md rounded-2xl border border-line bg-white shadow-lift soft-enter">
        <div className="flex items-start justify-between border-b border-line p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sage-deep">Share your experience</p>
            <h2 id="review-title" className="mt-1 font-display text-xl font-bold text-ink">Review your appointment</h2>
            <p className="mt-1 text-sm text-muted">Dr. {appointment.doctor?.name || "Your doctor"}</p>
          </div>
          <button type="button" className="icon-button h-8 w-8 border-0" onClick={onClose} disabled={saving} aria-label="Close review form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <label className="block text-sm font-semibold text-ink" htmlFor="review-rating">
            Rating
            <span className="mt-2 flex items-center gap-2">
              <Star className="h-5 w-5 fill-warning text-warning" />
              <select id="review-rating" className="field-control max-w-32" value={rating} onChange={(event) => setRating(event.target.value)}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
              </select>
            </span>
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="review-comment">Comment <span className="font-normal text-muted">(optional)</span></label>
            <textarea id="review-comment" className="field-control min-h-28 resize-y" maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share any feedback about your visit." />
          </div>
          {error && <p role="alert" className="rounded-xl bg-[#FCECEC] px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Submitting…" : "Submit review"}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ReviewModal;
