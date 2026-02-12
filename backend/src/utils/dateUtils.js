// Parser and comparators for Spanish date format strings
// Supports: "11-Feb", "11-Feb-2026"

const monthMap = {
  'ene': 0, 'enero': 0,
  'feb': 1, 'febrero': 1,
  'mar': 2, 'marzo': 2,
  'abr': 3, 'abril': 3,
  'may': 4, 'mayo': 4,
  'jun': 5, 'junio': 5,
  'jul': 6, 'julio': 6,
  'ago': 7, 'agosto': 7,
  'sep': 8, 'septiembre': 8, 'setiembre': 8,
  'oct': 9, 'octubre': 9,
  'nov': 10, 'noviembre': 10,
  'dic': 11, 'diciembre': 11
};

/**
 * Parse Spanish date string like "11-Feb" or "11-Feb-2026" to Date object
 * @param {string} fechaStr - Date string in format DD-Mmm or DD-Mmm-YYYY
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseFechaString = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return null;

  const normalized = fechaStr.toLowerCase().trim();
  // Match: DD-Mmm or DD-Mmm-YYYY
  const match = normalized.match(/^(\d{1,2})-([a-z]+)(-(\d{4}))?$/);

  if (!match) return null;

  const day = parseInt(match[1]);
  const monthStr = match[2];
  const month = monthMap[monthStr];
  const year = match[4] ? parseInt(match[4]) : new Date().getFullYear();

  if (month === undefined || isNaN(day) || isNaN(year)) return null;

  const date = new Date(year, month, day);

  // Validate the date is real (e.g., Feb 30 would be invalid)
  if (date.getDate() !== day || date.getMonth() !== month) return null;

  return date;
};

/**
 * Check if a date string represents today's date
 * @param {string} fechaStr - Date string
 * @returns {boolean} - True if date is today
 */
export const isFechaToday = (fechaStr) => {
  const fecha = parseFechaString(fechaStr);
  if (!fecha) return false;

  const today = new Date();
  return fecha.getDate() === today.getDate() &&
         fecha.getMonth() === today.getMonth() &&
         fecha.getFullYear() === today.getFullYear();
};

/**
 * Check if a date string represents a past date
 * @param {string} fechaStr - Date string
 * @returns {boolean} - True if date is in the past (before today)
 */
export const isFechaPast = (fechaStr) => {
  const fecha = parseFechaString(fechaStr);
  if (!fecha) return false;

  const today = new Date();
  // Normalize to midnight to compare only dates, not times
  today.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  return fecha < today;
};

/**
 * Check if a date string represents a future date
 * @param {string} fechaStr - Date string
 * @returns {boolean} - True if date is in the future (after today)
 */
export const isFechaFuture = (fechaStr) => {
  const fecha = parseFechaString(fechaStr);
  if (!fecha) return false;

  const today = new Date();
  // Normalize to midnight to compare only dates, not times
  today.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  return fecha > today;
};
