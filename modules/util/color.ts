import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { boundNumber, roundNumber } from "./number.js";

// Constants.
const DARK = 140; // Anything with a luminance > 140 is considered light.

// Regular expressions.

/**
 * Regular expression matching a three-digit hex color (e.g. `#F00`), capturing each channel.
 *
 * @see https://shelving.cc/util/color/HEX3_REGEXP
 */
export const HEX3_REGEXP = /^#?([0-F])([0-F])([0-F])$/i;

/**
 * Regular expression matching a six or eight digit hex color (e.g. `#FF0000` or `#FF0000FF`), capturing each channel.
 *
 * @see https://shelving.cc/util/color/HEX6_REGEXP
 */
export const HEX6_REGEXP = /^#?([0-F]{2})([0-F]{2})([0-F]{2})([0-F]{2})?$/i;

/**
 * Things that can be converted to a `Color` instance.
 *
 * @see https://shelving.cc/util/color/PossibleColor
 */
export type PossibleColor = Color | string;

/**
 * Represents an RGBA color with red, green, blue, and alpha channels (each `0`–`255`).
 *
 * @example new Color(255, 0, 0).hex // "#FF0000"
 * @see https://shelving.cc/util/color/Color
 */
export class Color {
	/**
	 * Make a `Color` from an unknown value, or `undefined` if it can't be parsed.
	 *
	 * @param possible The value to parse, typically a `Color` instance or a three/six/eight digit hex string.
	 * @returns The parsed `Color`, or `undefined` if `possible` cannot be converted.
	 * @example Color.from("#F00") // Color(255, 0, 0)
	 * @see https://shelving.cc/util/color/Color/from
	 */
	static from(possible: unknown): Color | undefined {
		if (isColor(possible)) return possible;
		if (typeof possible === "string") {
			const matches = (possible.match(HEX3_REGEXP) || possible.match(HEX6_REGEXP)) as
				| [never, string, string, string, string | undefined]
				| undefined;
			if (matches) {
				const [, r, g, b, a] = matches;
				return new Color(_parse(r), _parse(g), _parse(b), typeof a === "string" ? _parse(a) : undefined);
			}
		}
	}

	/**
	 * Red channel, bounded to `0`–`255`.
	 *
	 * @see https://shelving.cc/util/color/Color/r
	 */
	readonly r: number;

	/**
	 * Green channel, bounded to `0`–`255`.
	 *
	 * @see https://shelving.cc/util/color/Color/g
	 */
	readonly g: number;

	/**
	 * Blue channel, bounded to `0`–`255`.
	 *
	 * @see https://shelving.cc/util/color/Color/b
	 */
	readonly b: number;

	/**
	 * Alpha channel, bounded to `0`–`255`.
	 *
	 * @see https://shelving.cc/util/color/Color/a
	 */
	readonly a: number;

	/**
	 * Create a new `Color` from red, green, blue, and alpha channel values.
	 *
	 * @param r Red channel, bounded to `0`–`255` (defaults to `255`).
	 * @param g Green channel, bounded to `0`–`255` (defaults to `255`).
	 * @param b Blue channel, bounded to `0`–`255` (defaults to `255`).
	 * @param a Alpha channel, bounded to `0`–`255` (defaults to `255`).
	 * @example new Color(255, 0, 0) // opaque red
	 * @see https://shelving.cc/util/color/Color/constructor
	 */
	constructor(r = 255, g = 255, b = 255, a = 255) {
		this.r = boundNumber(r, 0, 255);
		this.g = boundNumber(g, 0, 255);
		this.b = boundNumber(b, 0, 255);
		this.a = boundNumber(a, 0, 255);
	}

	/**
	 * This color as a six or eight digit hex string (eight digits when the alpha channel is less than `255`).
	 *
	 * @see https://shelving.cc/util/color/Color/hex
	 */
	get hex(): string {
		return `#${_hex(this.r)}${_hex(this.g)}${_hex(this.b)}${this.a < 255 ? _hex(this.a) : ""}`;
	}

	/**
	 * This color as a CSS `rgb()` string.
	 *
	 * @see https://shelving.cc/util/color/Color/rgb
	 */
	get rgb(): string {
		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}

	/**
	 * This color as a CSS `rgba()` string.
	 *
	 * @see https://shelving.cc/util/color/Color/rgba
	 */
	get rgba(): string {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${roundNumber(this.a / 256, 4)})`;
	}

	/**
	 * The sRGB luminance of this color (`0`–`255`).
	 *
	 * @see https://shelving.cc/util/color/Color/luminance
	 */
	get luminance(): number {
		// Green is the largest component of the luminence, etc.
		return Math.round(0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b);
	}

	/**
	 * Whether this color is light (its luminance is above the dark/light threshold).
	 *
	 * @see https://shelving.cc/util/color/Color/isLight
	 */
	get isLight(): boolean {
		return this.luminance > DARK;
	}

	/**
	 * Whether this color is dark (its luminance is at or below the dark/light threshold).
	 *
	 * @see https://shelving.cc/util/color/Color/isDark
	 */
	get isDark(): boolean {
		return this.luminance <= DARK;
	}

	/**
	 * Return this color as an `rgba()` string.
	 *
	 * @returns This color formatted as a CSS `rgba()` string.
	 * @example String(new Color(255, 0, 0)) // "rgba(255, 0, 0, 1)"
	 * @see https://shelving.cc/util/color/Color/toString
	 */
	toString() {
		return this.rgba;
	}
}

function _parse(hex: string) {
	return Number.parseInt(hex.padStart(2, "00"), 16);
}

function _hex(channel: number) {
	return channel.toString(16).padStart(2, "00");
}

/**
 * Is an unknown value a `Color` instance?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `Color`, narrowing its type.
 * @example isColor(new Color()) // true
 * @see https://shelving.cc/util/color/isColor
 */
export function isColor(value: unknown): value is Color {
	return value instanceof Color;
}

/**
 * Assert that an unknown value is a `Color` instance.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertColor` itself).
 * @throws {RequiredError} If `value` is not a `Color` instance.
 * @example assertColor(new Color());
 * @see https://shelving.cc/util/color/assertColor
 */
export function assertColor(value: unknown, caller: AnyCaller = assertColor): asserts value is Color {
	if (!isColor(value)) throw new RequiredError("Must be color", { received: value, caller });
}

/**
 * Convert an unknown value to a `Color` instance, or return `undefined` if conversion fails.
 *
 * @param value The value to convert.
 * @returns The converted `Color`, or `undefined` if `value` cannot be converted.
 * @example getColor("#F00") // Color(255, 0, 0)
 * @see https://shelving.cc/util/color/getColor
 */
export function getColor(value: unknown): Color | undefined {
	return Color.from(value);
}

/**
 * Convert a possible color to a `Color` instance, or throw `RequiredError` if it can't be converted.
 *
 * @param value The possible color to convert.
 * @param caller Function to attribute a thrown error to (defaults to `requireColor` itself).
 * @throws {RequiredError} If `value` cannot be converted to a `Color`.
 * @example requireColor("#F00") // Color(255, 0, 0)
 * @see https://shelving.cc/util/color/requireColor
 */
export function requireColor(value: PossibleColor, caller: AnyCaller = requireColor): Color {
	const color = getColor(value);
	assertColor(color, caller);
	return color;
}
