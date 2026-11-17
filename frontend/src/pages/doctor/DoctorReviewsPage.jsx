import { useCallback } from "react";
import { MessageSquareText, Star } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { formatDate } from "../../utils/formatters.js";

const DoctorReviewsPage = () => {
  const loadReviews = useCallback(async () => {
    const { data } = await api.get("/doctors/me/reviews");
    return data;
  }, []);
  const { data, loading, error, reload } = useResource(loadReviews);

  if (loading) return <LoadingSpinner fullPage label="Loading patient reviews" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  const reviews = data?.reviews || [];
  const summary = data?.summary || {};

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Patient feedback" title="Reviews & ratings" description="Feedback submitted for completed appointments with you." />
      <section className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5E7] text-warning"><Star className="h-6 w-6 fill-current" /></span>
        <div>
          <p className="font-display text-3xl font-extrabold text-ink">{summary.averageRating == null ? "—" : Number(summary.averageRating).toFixed(1)}</p>
          <p className="mt-1 text-xs text-muted">Average rating</p>
        </div>
        <div className="h-10 w-px bg-line" />
        <div>
          <p className="font-display text-2xl font-bold text-ink">{summary.totalReviews || 0}</p>
          <p className="mt-1 text-xs text-muted">Total reviews</p>
        </div>
      </section>
      {reviews.length ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">{review.patient?.name || "Patient"}</h2>
                  <p className="mt-1 text-xs text-muted">{formatDate(review.createdAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E7] px-3 py-1.5 text-sm font-bold text-[#A36C16]">
                  <Star className="h-4 w-4 fill-current" />{review.rating} / 5
                </span>
              </div>
              {review.comment ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted">{review.comment}</p> : <p className="mt-4 text-sm italic text-muted">No written comment.</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={MessageSquareText} title="No reviews yet" description="Patient reviews will appear here after a completed appointment is rated." />
      )}
    </div>
  );
};

export default DoctorReviewsPage;
