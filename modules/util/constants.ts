/**
 * One thousand.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/THOUSAND
 */
export const THOUSAND = 1000;

/**
 * Ten thousand.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/TEN_THOUSAND
 */
export const TEN_THOUSAND = 10 * THOUSAND;

/**
 * Hundred thousand.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/HUNDRED_THOUSAND
 */
export const HUNDRED_THOUSAND = 100 * THOUSAND;

/**
 * One million.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/MILLION
 */
export const MILLION = 1000 * THOUSAND;

/**
 * One billion.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/BILLION
 */
export const BILLION = 1000 * MILLION;

/**
 * One trillion.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/TRILLION
 */
export const TRILLION = 1000 * BILLION;

/**
 * One second in milliseconds.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/SECOND
 */
export const SECOND = 1000;

/**
 * One minute in milliseconds.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/MINUTE
 */
export const MINUTE = 60 * SECOND;

/**
 * One hour in milliseconds.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/HOUR
 */
export const HOUR = 60 * MINUTE;

/**
 * One day in milliseconds.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/DAY
 */
export const DAY = 24 * HOUR;

/**
 * One week in milliseconds.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/WEEK
 */
export const WEEK = 7 * DAY;

/**
 * One month in milliseconds.
 * - Approximated as 30 days.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/MONTH
 */
export const MONTH = 30 * DAY;

/**
 * One year in milliseconds.
 * - Approximated as 365 days.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/YEAR
 */
export const YEAR = 365 * DAY;

/**
 * Non-breaking space (`U+00A0`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/NBSP
 */
export const NBSP = "\xA0";

/**
 * Thin space (`U+2009`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/THINSP
 */
export const THINSP = "\u2009";

/**
 * Non-breaking narrow space (`U+202F`, goes between numbers and their corresponding units).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/NNBSP
 */
export const NNBSP = "\u202F";

/**
 * The `ABORT` symbol indicates something was manually aborted.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/ABORT
 */
export const ABORT: unique symbol = Symbol("shelving/ABORT");

/**
 * The `NONE` symbol indicates something is nothing.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/NONE
 */
export const NONE: unique symbol = Symbol("shelving/NONE");

/**
 * The `SKIP` symbol indicates something should be silently skipped.
 *
 * @see https://dhoulb.github.io/shelving/util/constants/SKIP
 */
export const SKIP: unique symbol = Symbol("shelving/SKIP");

// Icons.

/**
 * Waiting/ellipsis icon character (`⋯`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/WAITING
 */
export const WAITING = "⋯";

/**
 * Success/check icon character (`✓`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/SUCCESS
 */
export const SUCCESS = "✓";

/**
 * Failure/cross icon character (`✗`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/FAILURE
 */
export const FAILURE = "✗";

/**
 * Up arrow icon character (`↑`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/UP
 */
export const UP = "↑";

/**
 * Down arrow icon character (`↓`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/DOWN
 */
export const DOWN = "↓";

/**
 * Right arrow icon character (`→`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/RIGHT
 */
export const RIGHT = "→";

/**
 * Left arrow icon character (`←`).
 *
 * @see https://dhoulb.github.io/shelving/util/constants/LEFT
 */
export const LEFT = "←";
