import { ValueError } from "../error/ValueError.js";
import { DAY, HOUR, MINUTE, SECOND } from "./constants.js";
import { getOptionalDate } from "./date.js";
import { wrapNumber } from "./number.js";
import type { Optional } from "./optional.js";

/** Class representing a time in the day in 24 hour format in the user's current locale. */
export class Time {
	/** Make a new `Time` instance from a time string. */
	static from(possible: unknown): Time | undefined {
		if (possible === undefined || possible === null || possible === "") return undefined;
		if (isTime(possible)) return possible;
		if (typeof possible === "string") {
			const matches = possible.match(TIME_REGEXP);
			if (matches) {
				const [, h, m, s, ms] = matches as [never, string, string, string | undefined, string | undefined];
				return new Time(
					Number.parseInt(h, 10) * HOUR +
						Number.parseInt(m, 10) * MINUTE +
						(typeof s === "string" ? Number.parseInt(s, 10) * SECOND : 0) +
						(typeof ms === "string" ? Number.parseInt(ms, 10) : 0),
				);
			}
		}
		const date = getOptionalDate(possible);
		if (date) return new Time(date.getHours() * HOUR + date.getMinutes() * MINUTE + date.getSeconds() * SECOND + date.getMilliseconds());
	}

	/* Total number of milliseconds in this time (always a number between `0` and `86400000` because higher/lower numbers wrap into the next/previous day). */
	readonly time: number;

	constructor(time: number) {
		this.time = wrapNumber(Math.round(time), 0, DAY);
	}

	/** Get the number of hours in this time. */
	get h() {
		return Math.trunc(this.time / HOUR);
	}

	/** Get the number of minutes in this time. */
	get m() {
		return Math.trunc((this.time % HOUR) / MINUTE);
	}

	/** Get the number of seconds in this time. */
	get s() {
		return Math.trunc((this.time % MINUTE) / SECOND);
	}

	/** Get the number of seconds in this time. */
	get ms() {
		return this.time % SECOND;
	}

	/** Get the time as in `hh:mm` format (hours, minutes), e.g. `13.59` */
	get short() {
		return `${_pad(this.h, 2)}:${_pad(this.m, 2)}`;
	}

	/** Get the time in `hh:mm:ss` format (hours, minutes seconds), e.g. `13.16.19.123` */
	get medium() {
		return `${_pad(this.h, 2)}:${_pad(this.m, 2)}:${_pad(this.s, 2)}`;
	}

	/** Get this time in `hh:mm:ss.fff` format (ISO 8601 compatible, hours, minutes, seconds, milliseconds), e.g. `13:16:19.123` */
	get long() {
		return `${_pad(this.h, 2)}:${_pad(this.m, 2)}:${_pad(this.s, 2)}.${_pad(this.ms, 3)}`;
	}

	/** Get a date corresponding to this time. */
	get date(): Date {
		const date = new Date();
		date.setHours(this.h, this.m, this.s, this.ms);
		return date;
	}

	/**
	 * Format this time using the browser locale settings with a specified amount of precision.
	 * @param precision Reveal additional parts of the time, e.g. `2` shows hours and minutes, `3` also shows seconds, and `4 | 5 | 6` show mlliseconds at increasing precision.
	 */
	format(precision: 2 | 3 | 4 | 5 | 6 = 2): string {
		return this.date.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: precision >= 3 ? "2-digit" : undefined,
			fractionalSecondDigits: precision >= 4 ? precision - 3 : undefined,
		} as Intl.DateTimeFormatOptions);
	}

	// Implement `valueOf()`
	valueOf(): number {
		return this.time;
	}

	// Implement `toString()`
	toString(): string {
		return this.long;
	}
}
function _pad(num: number, size: 2 | 3 | 4): string {
	return num.toString(10).padStart(size, "0000");
}

/** Regular expression that matches a time in ISO 8601 format. */
const TIME_REGEXP = /([0-9]+):([0-9]+)(?::([0-9]+)(?:.([0-9]+))?)?/;

/** Things that converted to times. */
export type PossibleTime = Time | Date | number | string;

/** Is an unknown value a `Time` instance. */
export function isTime(value: unknown): value is Time {
	return value instanceof Time;
}

/**
 * Convert a value to a `Time` instance, or return `undefined` if it couldn't be converted.
 * - Works with possible dates, e.g. `now` or `Date` or `2022-09-12 18:32` or `19827263567`
 * - Works with time strings, e.g. `18:32` or `23:59:59.999`
 *
 * @param possible Any value that we want to parse as a valid time (defaults to `undefined`).
 */
export function getOptionalTime(possible: unknown): Time | undefined {
	return Time.from(possible);
}

/**
 * Convert a possible date to a `Time` instance, or throw `ValueError` if it couldn't be converted (defaults to `"now"`).
 * @param possible Any value that we want to parse as a valid time (defaults to `"now"`).
 */
export function getTime(possible: PossibleTime = "now"): Time {
	const time = getOptionalTime(possible);
	if (!time) throw new ValueError("Invalid time", possible);
	return time;
}

/** Format a time as a string based on the browser locale settings. */
export function formatTime(time?: PossibleTime, precision: 2 | 3 | 4 | 5 | 6 = 2): string {
	return getTime(time).format(precision);
}

/** Format an optional time as a string based on the browser locale settings. */
export function formatOptionalTime(time: Optional<PossibleTime>, precision: 2 | 3 | 4 | 5 | 6 = 2): string | undefined {
	return getOptionalTime(time)?.format(precision);
}
