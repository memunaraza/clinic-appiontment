import { useCallback, useState } from "react";
import { CalendarDays, Clock3, FileText, Stethoscope } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormInput from "../../components/common/FormInput.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError, getTodayString } from "../../utils/formatters.js";

const BookAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    doctor: searchParams.get("doctorId") || "",
    appointmentDate: "",
    appointmentTime: "",
    reason: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const loadDoctors = useCallback(async () => {
    const { data } = await api.get("/doctors");
    return data.doctors;
  }, []);
  const { data: doctors, loading, error, reload } = useResource(loadDoctors);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.doctor) nextErrors.doctor = "Choose a doctor.";
    if (!form.appointmentDate || form.appointmentDate < getTodayString()) nextErrors.appointmentDate = "Choose today or a future date.";
    if (!form.appointmentTime) nextErrors.appointmentTime = "Choose a time.";
    if (form.reason.trim().length < 3) nextErrors.reason = "Add a short reason for your visit.";
    if (form.reason.trim().length > 1000) nextErrors.reason = "Keep the reason under 1,000 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await api.post("/appointments", {
        doctor: form.doctor,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason.trim()
      });
      toast.success("Appointment request sent to your doctor.");
      navigate("/patient/appointments");
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "We couldn’t book this appointment."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading booking options" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-3xl soft-enter">
      <PageHeading eyebrow="Take the next step" title="Book an appointment" description="Choose a provider and a time that works for you. Your appointment will be pending until your doctor confirms it." />
      <form onSubmit={handleSubmit} className="rounded-panel border border-line bg-white p-5 shadow-card sm:p-8" noValidate>
        <div className="mb-7 flex items-center gap-3 border-b border-line pb-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sage"><CalendarDays className="h-5 w-5" /></span>
          <div>
            <h2 className="font-display font-bold text-ink">Visit details</h2>
            <p className="mt-0.5 text-xs text-muted">All fields are required to request an appointment.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            as="select"
            label="Choose a doctor"
            id="doctor"
            name="doctor"
            icon={Stethoscope}
            value={form.doctor}
            onChange={handleChange}
            error={errors.doctor}
          >
            <option value="">Select a doctor</option>
            {(doctors || []).map((doctor) => <option key={doctor._id} value={doctor._id}>Dr. {doctor.name} — {doctor.specialization}</option>)}
          </FormInput>
          <FormInput label="Appointment date" id="appointmentDate" name="appointmentDate" type="date" min={getTodayString()} icon={CalendarDays} value={form.appointmentDate} onChange={handleChange} error={errors.appointmentDate} />
          <FormInput label="Preferred time" id="appointmentTime" name="appointmentTime" type="time" icon={Clock3} value={form.appointmentTime} onChange={handleChange} error={errors.appointmentTime} />
          <div className="sm:col-span-2">
            <FormInput
              as="textarea"
              label="Reason for visit"
              id="reason"
              name="reason"
              icon={FileText}
              rows={4}
              maxLength={1000}
              placeholder="Briefly tell your doctor what you'd like help with"
              value={form.reason}
              onChange={handleChange}
              error={errors.reason}
              className="resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-muted">{form.reason.length}/1000</p>
          </div>
        </div>
        {doctors?.length === 0 && <p className="mt-5 rounded-xl bg-[#FFF5E7] p-3 text-sm text-[#9A691B]">There are no active doctors available to book right now.</p>}
        <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-line pt-5 sm:flex-row">
          <button type="button" className="secondary-button" onClick={() => navigate("/patient/doctors")}>Browse doctors</button>
          <button type="submit" className="primary-button" disabled={submitting || !doctors?.length}>
            {submitting ? "Sending request…" : "Request appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentPage;
