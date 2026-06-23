/**
 * One thousand.
 *
 * @see https://shelving.cc/util/constants/THOUSAND
 */
export const THOUSAND = 1000;

/**
 * Ten thousand.
 *
 * @see https://shelving.cc/util/constants/TEN_THOUSAND
 */
export const TEN_THOUSAND = 10 * THOUSAND;

/**
 * Hundred thousand.
 *
 * @see https://shelving.cc/util/constants/HUNDRED_THOUSAND
 */
export const HUNDRED_THOUSAND = 100 * THOUSAND;

/**
 * One million.
 *
 * @see https://shelving.cc/util/constants/MILLION
 */
export const MILLION = 1000 * THOUSAND;

/**
 * One billion.
 *
 * @see https://shelving.cc/util/constants/BILLION
 */
export const BILLION = 1000 * MILLION;

/**
 * One trillion.
 *
 * @see https://shelving.cc/util/constants/TRILLION
 */
export const TRILLION = 1000 * BILLION;

/**
 * One second in milliseconds.
 *
 * @see https://shelving.cc/util/constants/SECOND
 */
export const SECOND = 1000;

/**
 * One minute in milliseconds.
 *
 * @see https://shelving.cc/util/constants/MINUTE
 */
export const MINUTE = 60 * SECOND;

/**
 * One hour in milliseconds.
 *
 * @see https://shelving.cc/util/constants/HOUR
 */
export const HOUR = 60 * MINUTE;

/**
 * One day in milliseconds.
 *
 * @see https://shelving.cc/util/constants/DAY
 */
export const DAY = 24 * HOUR;

/**
 * One week in milliseconds.
 *
 * @see https://shelving.cc/util/constants/WEEK
 */
export const WEEK = 7 * DAY;

/**
 * One month in milliseconds.
 * - Approximated as 30 days.
 *
 * @see https://shelving.cc/util/constants/MONTH
 */
export const MONTH = 30 * DAY;

/**
 * One year in milliseconds.
 * - Approximated as 365 days.
 *
 * @see https://shelving.cc/util/constants/YEAR
 */
export const YEAR = 365 * DAY;

/**
 * Non-breaking space (`U+00A0`).
 *
 * @see https://shelving.cc/util/constants/NBSP
 */
export const NBSP = "\xA0";

/**
 * Thin space (`U+2009`).
 *
 * @see https://shelving.cc/util/constants/THINSP
 */
export const THINSP = "\u2009";

/**
 * Non-breaking narrow space (`U+202F`, goes between numbers and their corresponding units).
 *
 * @see https://shelving.cc/util/constants/NNBSP
 */
export const NNBSP = "\u202F";

/**
 * The `ABORT` symbol indicates something was manually aborted.
 *
 * @see https://shelving.cc/util/constants/ABORT
 */
export const ABORT: unique symbol = Symbol("shelving/ABORT");

/**
 * The `NONE` symbol indicates something is nothing.
 *
 * @see https://shelving.cc/util/constants/NONE
 */
export const NONE: unique symbol = Symbol("shelving/NONE");

/**
 * The `SKIP` symbol indicates something should be silently skipped.
 *
 * @see https://shelving.cc/util/constants/SKIP
 */
export const SKIP: unique symbol = Symbol("shelving/SKIP");

// Icons.

/**
 * Waiting/ellipsis icon character (`⋯`).
 *
 * @see https://shelving.cc/util/constants/WAITING
 */
export const WAITING = "⋯";

/**
 * Success/check icon character (`✓`).
 *
 * @see https://shelving.cc/util/constants/SUCCESS
 */
export const SUCCESS = "✓";

/**
 * Failure/cross icon character (`✗`).
 *
 * @see https://shelving.cc/util/constants/FAILURE
 */
export const FAILURE = "✗";

/**
 * Up arrow icon character (`↑`).
 *
 * @see https://shelving.cc/util/constants/UP
 */
export const UP = "↑";

/**
 * Down arrow icon character (`↓`).
 *
 * @see https://shelving.cc/util/constants/DOWN
 */
export const DOWN = "↓";

/**
 * Right arrow icon character (`→`).
 *
 * @see https://shelving.cc/util/constants/RIGHT
 */
export const RIGHT = "→";

/**
 * Left arrow icon character (`←`).
 *
 * @see https://shelving.cc/util/constants/LEFT
 */
export const LEFT = "←";
