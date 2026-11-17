import assert from "node:assert/strict";
import test from "node:test";
import doctorSeedProfiles from "../seeds/doctors.js";

test("doctor sample data contains at least ten unique doctor accounts", () => {
  assert.ok(doctorSeedProfiles.length >= 10);
  assert.equal(new Set(doctorSeedProfiles.map(({ email }) => email)).size, doctorSeedProfiles.length);
  assert.ok(doctorSeedProfiles.every(({ specialization, experience }) => specialization && experience >= 0));
});
