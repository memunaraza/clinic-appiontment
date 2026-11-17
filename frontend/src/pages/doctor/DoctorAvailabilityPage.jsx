import { useCallback, useState } from "react";
import { CalendarRange, Clock3, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError } from "../../utils/formatters.js";

const DoctorAvailabilityPage = () => {
  const [days, setDays] = useState(null);
  const [saving, setSaving] = useState(false);
  const loadAvailability = useCallback(async () => {
    const { data } = await api.get("/doctors/me/availability");
    return data.availability;
  }, []);
  const { data: availability, loading, error, reload } = useResource(loadAvailability);

  const scheduleDays = days || availability || [];

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setDays((current) => (current || availability || []).map((day, index) => index !== dayIndex ? day : ({
      ...day,
      slots: day.slots.map((slot, currentSlotIndex) => currentSlotIndex !== slotIndex ? slot : { ...slot, [field]: value })
    })));
  };

  const addSlot = (dayIndex) => {
    setDays((current) => (current || availability || []).map((day, index) => index !== dayIndex ? day : ({
      ...day,
      slots: [...day.slots, { startTime: "", endTime: "" }]
    })));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setDays((current) => (current || availability || []).map((day, index) => index !== dayIndex ? day : ({
      ...day,
      slots: day.slots.filter((_, currentSlotIndex) => currentSlotIndex !== slotIndex)
    })));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/doctors/me/availability", { days: scheduleDays });
      setDays(data.availability);
      toast.success("Your availability was saved.");
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not save your availability."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading your weekly availability" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  return (
    <div className="soft-enter">
      <PageHeading
        eyebrow="Weekly schedule"
        title="Availability"
        description="Set the days and time windows when patients can request appointments."
        action={<button type="button" className="primary-button" onClick={saveAvailability} disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving…" : "Save schedule"}</button>}
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#DCE9E4] bg-white px-4 py-3.5 text-sm text-muted">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
        <p>Time slots use your local clinic time. Appointment requests are checked against saved availability.</p>
      </div>
      {scheduleDays.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scheduleDays.map((day, dayIndex) => (
            <section key={day.day} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-deep">Weekly schedule</p>
                  <h2 className="mt-1 font-display text-lg font-bold text-ink">{day.day}</h2>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${day.slots.length ? "bg-[#E7F5EF] text-success" : "bg-slate-100 text-muted"}`}>
                  {day.slots.length ? "Available" : "Day off"}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {day.slots.length ? day.slots.map((slot, slotIndex) => (
                  <div key={`${day.day}-${slotIndex}`} className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`${day.day}-start-${slotIndex}`}>Start time for {day.day} slot {slotIndex + 1}</label>
                    <input id={`${day.day}-start-${slotIndex}`} className="field-control min-w-0 px-2.5" type="time" value={slot.startTime} onChange={(event) => updateSlot(dayIndex, slotIndex, "startTime", event.target.value)} />
                    <span className="text-xs text-muted">to</span>
                    <label className="sr-only" htmlFor={`${day.day}-end-${slotIndex}`}>End time for {day.day} slot {slotIndex + 1}</label>
                    <input id={`${day.day}-end-${slotIndex}`} className="field-control min-w-0 px-2.5" type="time" value={slot.endTime} onChange={(event) => updateSlot(dayIndex, slotIndex, "endTime", event.target.value)} />
                    <button type="button" className="icon-button h-9 w-9 shrink-0 border-0 text-danger hover:bg-[#FCECEC]" onClick={() => removeSlot(dayIndex, slotIndex)} aria-label={`Remove ${day.day} time slot`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                )) : (
                  <p className="rounded-xl bg-canvas px-3 py-4 text-sm text-muted">No hours set for this day.</p>
                )}
              </div>
              <button type="button" className="secondary-button mt-4 w-full py-2.5 text-xs" onClick={() => addSlot(dayIndex)} disabled={day.slots.length >= 12}>
                <Plus className="h-4 w-4" /> Add time slot
              </button>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarRange} title="Availability is not available" description="Reload the page to try again." action={<button type="button" className="secondary-button py-2.5" onClick={reload}>Reload schedule</button>} />
      )}
    </div>
  );
};

export default DoctorAvailabilityPage;
