export const isObjectBody = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const isValidName = (value) =>
  typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 100;

export const isValidEmail = (value) =>
  typeof value === "string" &&
  value.trim().length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPassword = (value) =>
  typeof value === "string" &&
  Array.from(value).length >= 8 &&
  Buffer.byteLength(value, "utf8") <= 72;

export const isValidExperience = (value) => {
  const isNumber = typeof value === "number" && Number.isFinite(value);
  const isNumericString = typeof value === "string" && value.trim() !== "";
  if (!isNumber && !isNumericString) return false;
  return Number.isFinite(Number(value)) && Number(value) >= 0;
};
