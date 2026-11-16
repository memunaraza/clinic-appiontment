import { useState } from "react";
import { Eye, EyeOff, Stethoscope, X } from "lucide-react";
import FormInput from "../common/FormInput.jsx";
import { isValidPassword } from "../../utils/validation.js";

const initialForm = { name: "", email: "", password: "", specialization: "", experience: "" };

const CreateDoctorModal = ({ onClose, onSubmit, saving }) => {
  const [form, setForm] = useState(initialForm);
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
    if (!isValidPassword(form.password)) next.password = "Use at least 8 characters and no more than 72 UTF-8 bytes.";
    if (!form.specialization.trim()) next.specialization = "Enter a specialization.";
    if (form.experience === "" || !Number.isFinite(Number(form.experience)) || Number(form.experience) < 0) next.experience = "Enter a valid non-negative number.";
    setErrors(next);
    if (Object.keys(next).length) return;
    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      specialization: form.specialization.trim(),
      experience: Number(form.experience)
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-medical/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-doctor-title" className="my-auto w-full max-w-xl rounded-2xl border border-line bg-white shadow-lift soft-enter">
        <div className="flex items-start justify-between border-b border-line px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sage"><Stethoscope className="h-5 w-5" /></span>
            <div>
              <h2 id="create-doctor-title" className="font-display text-lg font-bold text-ink">Add a doctor</h2>
              <p className="mt-0.5 text-xs text-muted">Create a secure provider account for your clinic.</p>
            </div>
          </div>
          <button type="button" className="icon-button h-8 w-8 border-0" onClick={onClose} disabled={saving} aria-label="Close dialog"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5 sm:p-7" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Full name" id="doctor-name" name="name" value={form.name} onChange={update} placeholder="Taylor Reed" error={errors.name} />
            <FormInput label="Email address" id="doctor-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="doctor@clinic.com" error={errors.email} />
            <FormInput label="Specialization" id="doctor-specialization" name="specialization" value={form.specialization} onChange={update} placeholder="e.g. Cardiology" error={errors.specialization} />
            <FormInput label="Years of experience" id="doctor-experience" name="experience" type="number" min="0" step="1" value={form.experience} onChange={update} placeholder="8" error={errors.experience} />
            <div className="sm:col-span-2">
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
            </div>
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-line pt-4 sm:flex-row">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Creating account…" : "Create doctor account"}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateDoctorModal;
