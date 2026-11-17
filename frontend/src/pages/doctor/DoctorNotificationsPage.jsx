import { useCallback } from "react";
import { Bell, Check, CheckCheck, ClipboardCheck, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { formatDate, getDisplayError } from "../../utils/formatters.js";

const DoctorNotificationsPage = () => {
  const loadNotifications = useCallback(async () => {
    const { data } = await api.get("/doctors/me/notifications");
    return data;
  }, []);
  const { data, loading, error, reload } = useResource(loadNotifications);

  const markRead = async (id) => {
    try {
      await api.patch(`/doctors/me/notifications/${id}/read`);
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update this notification."));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/doctors/me/notifications/read-all");
      toast.success("Notifications marked as read.");
      reload();
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update your notifications."));
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading your notifications" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow="Practice updates"
        title="Notifications"
        description={unreadCount ? `You have ${unreadCount} unread update${unreadCount === 1 ? "" : "s"}.` : "Stay up to date with new appointment requests and patient feedback."}
        action={unreadCount > 0 && <button type="button" className="secondary-button" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</button>}
      />
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.type === "new_review" ? Star : ClipboardCheck;
            return (
              <article key={notification._id} className={`flex items-start gap-4 rounded-2xl border p-4 shadow-card sm:p-5 ${notification.readAt ? "border-line bg-white" : "border-sage/40 bg-white"}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notification.type === "new_review" ? "bg-[#FFF5E7] text-[#A36C16]" : "bg-accent text-sage-deep"}`}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink">{notification.title}</h2>
                    {!notification.readAt && <span className="h-2 w-2 rounded-full bg-sage-deep" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(notification.createdAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  <Link to="/doctor/appointments" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-medical hover:text-sage-deep">
                    View appointments <Check className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {!notification.readAt && (
                  <button type="button" className="icon-button h-9 w-9 shrink-0" onClick={() => markRead(notification._id)} aria-label={`Mark ${notification.title} as read`} title="Mark as read">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Bell} title="You're all caught up" description="New appointment requests and patient reviews will appear here." />
      )}
    </div>
  );
};

export default DoctorNotificationsPage;
