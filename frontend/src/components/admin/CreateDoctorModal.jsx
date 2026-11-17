import { useState } from "react";
import { Eye, EyeOff, Stethoscope, X } from "lucide-react";
import FormInput from "../common/FormInput.jsx";
import { isValidPassword } from "../../utils/validation.js";

const createForm = (doctor) => ({
  name: doctor?.name || "",
  email: doctor?.email || "",
  password: "",
  phone: doctor?.phone || "",
  profilePicture: doctor?.profilePicture || "",
  specialization: doctor?.specialization || "",
  qualification: doctor?.qualification || "",
  experience: doctor?.experience ?? "",
  consultationFee: doctor?.consultationFee ?? 0,
  biography: doctor?.biography || ""
});

const CreateDoctorModal = ({ doctor, onClose, onSubmit, saving }) => {
  const isEditing = Boolean(doctor);
  const [form, setForm] = useState(() => createForm(doctor));
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter the doctor's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!isEditing && !isValidPassword(form.password)) next.password = "Use at least 8 characters and no more than 72 UTF-8 bytes.";
    if (!form.specialization.trim()) next.specialization = "Enter a specialization.";
    if (form.experience === "" || !Number.isFinite(Number(form.experience)) || Number(form.experience) < 0) next.experience = "Enter a valid non-negative number.";
    if (form.phone && (!/^[+0-9().\s-]{7,32}$/.test(form.phone) || !/\d/.test(form.phone))) next.phone = "Enter a valid phone number.";
    if (form.profilePicture) {
      try {
        const url = new URL(form.profilePicture);
        if (!["http:", "https:"].includes(url.protocol)) next.profilePicture = "Use an HTTP or HTTPS image URL.";
      } catch {
        next.profilePicture = "Enter a valid image URL.";
      }
    }
    if (form.qualification.trim().length > 200) next.qualification = "Qualification must be 200 characters or fewer.";
    if (form.consultationFee === "" || !Number.isFinite(Number(form.consultationFee)) || Number(form.consultationFee) < 0) next.consultationFee = "Enter a valid non-negative fee.";
    if (form.biography.trim().length > 2000) next.biography = "Biography must be 2000 characters or fewer.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const values = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      profilePicture: form.profilePicture.trim(),
      specialization: form.specialization.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      biography: form.biography.trim()
    };
    if (!isEditing) values.password = form.password;
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-medical/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-doctor-title" className="my-auto w-full max-w-xl rounded-2xl border border-line bg-white shadow-lift soft-enter">
        <div className="flex items-start justify-between border-b border-line px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sage"><Stethoscope className="h-5 w-5" /></span>
            <div>
              <h2 id="create-doctor-title" className="font-display text-lg font-bold text-ink">{isEditing ? "Edit doctor profile" : "Add a doctor"}</h2>
                  <p className="mt-0.5 text-xs text-muted">{isEditing ? "Update account and professional details." : "Create a secure provider account for your clinic."}</p>
            </div>
          </div>
          <button type="button" className="icon-button h-8 w-8 border-0" onClick={onClose} disabled={saving} aria-label="Close dialog"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5 sm:p-7" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Full name" id="doctor-name" name="name" value={form.name} onChange={update} placeholder="Taylor Reed" error={errors.name} />
            <FormInput label="Email address" id="doctor-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="doctor@clinic.com" error={errors.email} />
            <FormInput label="Phone" id="doctor-phone" name="phone" type="tel" value={form.phone} onChange={update} placeholder="+1 555 010 1234" error={errors.phone} />
            <FormInput label="Profile picture URL" id="doctor-picture" name="profilePicture" type="url" value={form.profilePicture} onChange={update} placeholder="https://clinic.example/doctor.jpg" error={errors.profilePicture} />
            <FormInput label="Specialization" id="doctor-specialization" name="specialization" value={form.specialization} onChange={update} placeholder="e.g. Cardiology" error={errors.specialization} />
            <FormInput label="Qualification" id="doctor-qualification" name="qualification" value={form.qualification} onChange={update} placeholder="e.g. MD, Board Certified" error={errors.qualification} />
            <FormInput label="Years of experience" id="doctor-experience" name="experience" type="number" min="0" step="1" value={form.experience} onChange={update} placeholder="8" error={errors.experience} />
            <FormInput label="Consultation fee" id="doctor-fee" name="consultationFee" type="number" min="0" step="0.01" value={form.consultationFee} onChange={update} placeholder="0" error={errors.consultationFee} />
            {!isEditing && <div className="sm:col-span-2">
              <FormInput
                label="Temporary password"
                id="doctor-password"
                name="password"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoComplete="new-password"
                value={form.password}
                onChange={update}
                placeholder="At least 8 characters"
                error={errors.password}
                trailing={<button type="button" className="rounded-lg p-2 text-slate-400 hover:text-medical" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
              />
            </div>}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="doctor-biography">Biography</label>
              <textarea id="doctor-biography" name="biography" className="field-control min-h-24 resize-y" value={form.biography} onChange={update} maxLength={2000} placeholder="A short introduction for patients" />
              {errors.biography && <p className="mt-1 text-xs text-danger">{errors.biography}</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-line pt-4 sm:flex-row">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? (isEditing ? "Saving changes…" : "Creating account…") : (isEditing ? "Save changes" : "Create doctor account")}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateDoctorModal;
