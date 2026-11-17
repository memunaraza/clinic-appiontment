import { isValidExperience } from "./validation.js";

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const isValidPhone = (value) =>
  typeof value === "string" &&
  value.length <= 32 &&
  (value.trim() === "" || (/^[+0-9().\s-]+$/.test(value) && /\d/.test(value)));

const isValidProfilePicture = (value) => {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export const normalizeDoctorProfileFields = (body, { partial = false } = {}) => {
  const profile = {};
  const fields = ["phone", "profilePicture", "specialization", "qualification", "experience", "consultationFee", "biography"];
  const shouldValidate = (field) => !partial || hasOwn(body, field);

  if (!fields.some(shouldValidate)) {
    return { profile, error: "" };
  }
  if (shouldValidate("phone")) {
    const value = body.phone ?? "";
    if (!isValidPhone(value)) return { profile: null, error: "Enter a valid phone number." };
    profile.phone = value.trim();
  }
  if (shouldValidate("profilePicture")) {
    const value = body.profilePicture ?? "";
    if (!isValidProfilePicture(value)) {
      return { profile: null, error: "Profile picture must be an HTTP or HTTPS URL." };
    }
    profile.profilePicture = value.trim();
  }
  if (shouldValidate("specialization")) {
    if (typeof body.specialization !== "string" || !body.specialization.trim() || body.specialization.trim().length > 100) {
      return { profile: null, error: "Specialization must be between 1 and 100 characters." };
    }
    profile.specialization = body.specialization.trim();
  }
  if (shouldValidate("qualification")) {
    const value = body.qualification ?? "";
    if (typeof value !== "string" || value.trim().length > 200) {
      return { profile: null, error: "Qualification must be 200 characters or fewer." };
    }
    profile.qualification = value.trim();
  }
  if (shouldValidate("experience")) {
    if (!isValidExperience(body.experience)) {
      return { profile: null, error: "Experience must be a non-negative number." };
    }
    profile.experience = Number(body.experience);
  }
  if (shouldValidate("consultationFee")) {
    const value = body.consultationFee ?? 0;
    if (!isValidExperience(value)) {
      return { profile: null, error: "Consultation fee must be a non-negative number." };
    }
    profile.consultationFee = Number(value);
  }
  if (shouldValidate("biography")) {
    const value = body.biography ?? "";
    if (typeof value !== "string" || value.trim().length > 2000) {
      return { profile: null, error: "Biography must be 2000 characters or fewer." };
    }
    profile.biography = value.trim();
  }

  return { profile, error: "" };
};
