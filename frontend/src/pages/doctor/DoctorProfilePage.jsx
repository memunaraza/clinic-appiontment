import { useCallback, useState } from "react";
import { Camera, LockKeyhole, Save, Stethoscope, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/common/FormInput.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import useResource from "../../hooks/useResource.js";
import api from "../../services/api.js";
import { getDisplayError, getInitials } from "../../utils/formatters.js";
import { isValidPassword } from "../../utils/validation.js";

const profileFields = [
  "name",
  "email",
  "phone",
  "profilePicture",
  "specialization",
  "qualification",
  "experience",
  "consultationFee",
  "biography"
];

const DoctorProfilePage = () => {
  const { updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const loadProfile = useCallback(async () => {
    const { data } = await api.get("/doctors/me/profile");
    return data.doctor;
  }, []);
  const { data: doctor, loading, error, reload } = useResource(loadProfile);

  const initialForm = Object.fromEntries(profileFields.map((field) => [field, doctor?.[field] ?? ""]));
  const profileForm = form || initialForm;

  const updateField = (event) => {
    setForm((current) => ({ ...(current || initialForm), [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        ...profileForm,
        experience: Number(profileForm.experience),
        consultationFee: Number(profileForm.consultationFee)
      };
      const { data } = await api.patch("/doctors/me/profile", payload);
      setForm(Object.fromEntries(profileFields.map((field) => [field, data.doctor[field] ?? ""])));
      updateUser(data.doctor);
      toast.success("Your profile was updated.");
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not update your profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!isValidPassword(passwords.newPassword)) {
      toast.error("Use at least 8 characters and no more than 72 UTF-8 bytes for your new password.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch("/doctors/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Your password was changed.");
    } catch (requestError) {
      toast.error(getDisplayError(requestError, "Could not change your password."));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading your professional profile" />;
  if (error) return <RequestError message={error} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-4xl soft-enter">
      <PageHeading eyebrow="Your professional profile" title="Profile & settings" description="Keep your contact details and professional information up to date." />

      <form onSubmit={saveProfile} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-5 bg-medical px-5 py-6 text-white sm:flex-row sm:items-center sm:px-8 sm:py-7">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 font-display text-xl font-bold">
            {profileForm.profilePicture
              ? <img src={profileForm.profilePicture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              : getInitials(profileForm.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Doctor profile</p>
            <h2 className="mt-1 truncate font-display text-xl font-bold">{profileForm.name || "Your name"}</h2>
            <p className="mt-1 truncate text-sm text-white/70">{profileForm.specialization || "Add your specialization"}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/80">
            <Camera className="h-4 w-4" /> Update photo URL below
          </span>
        </div>

        <div className="space-y-7 p-5 sm:p-8">
          <section>
            <h3 className="flex items-center gap-2 font-display font-bold text-ink"><UserRound className="h-4 w-4 text-sage-deep" /> Account details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormInput label="Full name" id="profile-name" name="name" value={profileForm.name || ""} onChange={updateField} required />
              <FormInput label="Email address" id="profile-email" name="email" type="email" value={profileForm.email || ""} onChange={updateField} required />
              <FormInput label="Phone" id="profile-phone" name="phone" type="tel" value={profileForm.phone || ""} onChange={updateField} placeholder="+1 555 010 1234" />
              <FormInput label="Profile picture URL" id="profile-picture" name="profilePicture" type="url" value={profileForm.profilePicture || ""} onChange={updateField} placeholder="https://clinic.example/doctor.jpg" />
            </div>
          </section>

          <section className="border-t border-line pt-6">
            <h3 className="flex items-center gap-2 font-display font-bold text-ink"><Stethoscope className="h-4 w-4 text-sage-deep" /> Professional details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormInput label="Specialization" id="profile-specialization" name="specialization" value={profileForm.specialization || ""} onChange={updateField} required />
              <FormInput label="Qualification" id="profile-qualification" name="qualification" value={profileForm.qualification || ""} onChange={updateField} />
              <FormInput label="Years of experience" id="profile-experience" name="experience" type="number" min="0" step="1" value={profileForm.experience ?? ""} onChange={updateField} required />
              <FormInput label="Consultation fee" id="profile-fee" name="consultationFee" type="number" min="0" step="0.01" value={profileForm.consultationFee ?? ""} onChange={updateField} />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="profile-biography">Biography</label>
                <textarea id="profile-biography" name="biography" className="field-control min-h-32 resize-y" maxLength={2000} value={profileForm.biography || ""} onChange={updateField} placeholder="Introduce yourself and your approach to patient care." />
              </div>
            </div>
          </section>

          <div className="flex justify-end border-t border-line pt-5">
            <button type="submit" className="primary-button" disabled={savingProfile}><Save className="h-4 w-4" />{savingProfile ? "Saving…" : "Save profile"}</button>
          </div>
        </div>
      </form>

      <form onSubmit={changePassword} className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><LockKeyhole className="h-5 w-5 text-sage-deep" /> Change password</h2>
          <p className="mt-1 text-sm text-muted">Choose a unique password with at least 8 characters.</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormInput label="Current password" id="current-password" name="currentPassword" type="password" autoComplete="current-password" maxLength={72} value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} required />
          <span className="hidden sm:block" />
          <FormInput label="New password" id="new-password" name="newPassword" type="password" autoComplete="new-password" maxLength={72} value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} required />
          <FormInput label="Confirm new password" id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" maxLength={72} value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} required />
        </div>
        <div className="mt-5 flex justify-end border-t border-line pt-5">
          <button type="submit" className="secondary-button" disabled={savingPassword}><LockKeyhole className="h-4 w-4" />{savingPassword ? "Updating…" : "Update password"}</button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfilePage;
