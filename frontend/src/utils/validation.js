export const isValidPassword = (value) =>
  typeof value === "string" &&
  Array.from(value).length >= 8 &&
  new TextEncoder().encode(value).length <= 72;
