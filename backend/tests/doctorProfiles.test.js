import assert from "node:assert/strict";
import test from "node:test";
import { mergeDoctorProfiles } from "../utils/doctorProfiles.js";
import { normalizeDoctorProfileFields } from "../utils/doctorProfileValidation.js";

test("mergeDoctorProfiles adds separate profile data without changing account IDs", () => {
  const users = [
    { _id: "doctor-account-id", name: "Alex Doctor", role: "doctor" },
    { _id: "patient-account-id", name: "Sam Patient", role: "patient" }
  ];
  const profiles = [
    { user: "doctor-account-id", specialization: "Cardiology", experience: 8 }
  ];

  const merged = mergeDoctorProfiles(users, profiles);

  assert.equal(merged[0]._id, "doctor-account-id");
  assert.equal(merged[0].specialization, "Cardiology");
  assert.equal(merged[0].experience, 8);
  assert.equal(merged[1]._id, "patient-account-id");
  assert.equal(merged[1].specialization, undefined);
});

test("normalizeDoctorProfileFields validates and normalizes doctor profile details", () => {
  const { profile, error } = normalizeDoctorProfileFields({
    phone: " +1 555 010 1234 ",
    profilePicture: "https://clinic.example/doctor.jpg",
    specialization: " Cardiology ",
    qualification: " MD ",
    experience: "8",
    consultationFee: "125.50",
    biography: " Experienced physician "
  });

  assert.equal(error, "");
  assert.equal(profile.phone, "+1 555 010 1234");
  assert.equal(profile.specialization, "Cardiology");
  assert.equal(profile.experience, 8);
  assert.equal(profile.consultationFee, 125.5);
  assert.equal(profile.biography, "Experienced physician");
});

test("normalizeDoctorProfileFields rejects unsafe picture protocols and preserves omitted partial fields", () => {
  const invalid = normalizeDoctorProfileFields({ profilePicture: "javascript:alert(1)" }, { partial: true });
  const partial = normalizeDoctorProfileFields({ biography: " Updated " }, { partial: true });

  assert.match(invalid.error, /HTTP or HTTPS/);
  assert.equal(partial.error, "");
  assert.deepEqual(partial.profile, { biography: "Updated" });
});
