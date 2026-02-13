// Parser and comparators for date format strings
// Supports: "DD-MM-YYYY" format (e.g., "12-02-2026")

/**
 * Parse date string like "12-02-2026" to Date object (UTC midnight)
 * @param {string} fechaStr - Date string in format DD-MM-YYYY
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseFechaString = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return null;

  const trimmed = fechaStr.trim();
  // Match: DD-MM-YYYY
  const match = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

  if (!match) return null;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]) - 1; // Convert to 0-indexed month
  const year = parseInt(match[3]);

  if (isNaN(day) || isNaN(month + 1) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month + 1 < 1 || month + 1 > 12) return null;

  // Create UTC date at midnight
  const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  // Validate the date is real (e.g., Feb 30 would be invalid)
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month || date.getUTCFullYear() !== year) return null;

  return date;
};

/**
 * Check if a date string represents today's date (in Colombia timezone GMT-5)
 * @param {string} fechaStr - Date string in format DD-MM-YYYY
 * @returns {boolean} - True if date is today in Colombia
 */
export const isFechaToday = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return false;

  const trimmed = fechaStr.trim();
  // Match: DD-MM-YYYY
  const match = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Get today's date in Colombia (GMT-5)
  const now = new Date();
  const colombiaDate = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // GMT-5

  const todayDay = colombiaDate.getUTCDate();
  const todayMonth = colombiaDate.getUTCMonth() + 1;
  const todayYear = colombiaDate.getUTCFullYear();

  return day === todayDay && month === todayMonth && year === todayYear;
};

/**
 * Check if a date string represents a past date (in Colombia timezone GMT-5)
 * @param {string} fechaStr - Date string in format DD-MM-YYYY
 * @returns {boolean} - True if date is before today in Colombia
 */
export const isFechaPast = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return false;

  const trimmed = fechaStr.trim();
  // Match: DD-MM-YYYY
  const match = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Get today's date in Colombia (GMT-5)
  const now = new Date();
  const colombiaDate = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // GMT-5

  const todayDay = colombiaDate.getUTCDate();
  const todayMonth = colombiaDate.getUTCMonth() + 1;
  const todayYear = colombiaDate.getUTCFullYear();

  // Compare as numeric dates (YYYYMMDD)
  const dateNum = year * 10000 + month * 100 + day;
  const todayNum = todayYear * 10000 + todayMonth * 100 + todayDay;

  return dateNum < todayNum;
};

/**
 * Check if a date string represents a future date (in Colombia timezone GMT-5)
 * @param {string} fechaStr - Date string in format DD-MM-YYYY
 * @returns {boolean} - True if date is after today in Colombia
 */
export const isFechaFuture = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return false;

  const trimmed = fechaStr.trim();
  // Match: DD-MM-YYYY
  const match = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Get today's date in Colombia (GMT-5)
  const now = new Date();
  const colombiaDate = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // GMT-5

  const todayDay = colombiaDate.getUTCDate();
  const todayMonth = colombiaDate.getUTCMonth() + 1;
  const todayYear = colombiaDate.getUTCFullYear();

  // Compare as numeric dates (YYYYMMDD)
  const dateNum = year * 10000 + month * 100 + day;
  const todayNum = todayYear * 10000 + todayMonth * 100 + todayDay;

  return dateNum > todayNum;
};
