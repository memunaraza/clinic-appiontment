import assert from "node:assert/strict";
import test from "node:test";
import {
  isObjectBody,
  isValidEmail,
  isValidExperience,
  isValidName,
  isValidPassword
} from "../utils/validation.js";

test("isObjectBody accepts records and rejects null and arrays", () => {
  assert.equal(isObjectBody({ name: "Patient" }), true);
  assert.equal(isObjectBody(null), false);
  assert.equal(isObjectBody([]), false);
});

test("isValidName trims and enforces the supported length", () => {
  assert.equal(isValidName("  Memuna Clinic  "), true);
  assert.equal(isValidName("A"), false);
  assert.equal(isValidName(`A${"x".repeat(100)}`), false);
});

test("isValidEmail accepts normalized input and rejects invalid types and lengths", () => {
  assert.equal(isValidEmail("  person@example.com  "), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail(12), false);
  assert.equal(isValidEmail(`${"a".repeat(245)}@example.com`), false);
});

test("isValidPassword enforces bcrypt's UTF-8 input limit", () => {
  assert.equal(isValidPassword("correct-horse"), true);
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("x".repeat(72)), true);
  assert.equal(isValidPassword("x".repeat(73)), false);
  assert.equal(isValidPassword("😀".repeat(19)), false);
});

test("isValidExperience rejects empty and non-numeric values", () => {
  assert.equal(isValidExperience(0), true);
  assert.equal(isValidExperience("8"), true);
  assert.equal(isValidExperience(""), false);
  assert.equal(isValidExperience(null), false);
  assert.equal(isValidExperience(-1), false);
});
