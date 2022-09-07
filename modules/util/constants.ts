/** One thousand. */
export const THOUSAND = 1000;

/** Ten thousand. */
export const TEN_THOUSAND = 10 * THOUSAND;

/** Hundred thousand. */
export const HUNDRED_THOUSAND = 100 * THOUSAND;

/** One million. */
export const MILLION = 1000 * THOUSAND;

/** One billion. */
export const BILLION = 1000 * MILLION;

/** One trillion. */
export const TRILLION = 1000 * BILLION;

/** One second in millseconds. */
export const SECOND = 1000;

/** One minute in millseconds. */
export const MINUTE = 60 * SECOND;

/** One hour in millseconds. */
export const HOUR = 60 * MINUTE;

/** One day in millseconds. */
export const DAY = 24 * HOUR;

/** One week in millseconds. */
export const WEEK = 7 * DAY;

/** One month in millseconds. */
export const MONTH = 30 * DAY;

/** One year in millseconds. */
export const YEAR = 365 * DAY;

/** Non-breaking space. */
export const NBSP = "\xA0";

/** Thin space. */
export const THINSP = "\u2009";

/** Non-breaking narrow space (goes between numbers and their corresponding units). */
export const NNBSP = "\u202F";

/** The `SIGNAL` symbol indicates a signal. */
export const SIGNAL: unique symbol = Symbol("shelving/SIGNAL");
