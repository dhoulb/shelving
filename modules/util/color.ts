import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { boundNumber, roundNumber } from "./number.js";

// Constants.
const DARK = 140; // Anything with a luminance > 140 is considered light.

// Regular expressions.
export const HEX3_REGEXP = /^#?([0-F])([0-F])([0-F])$/i;
export const HEX6_REGEXP = /^#?([0-F]{2})([0-F]{2})([0-F]{2})([0-F]{2})?$/i;

/** Things that can be converted to a `Color` instance. */
export type PossibleColor = Color | string;

/** Represent a color. */
export class Color {
	/** Make a `Color` from an unknown value. */
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

	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
	constructor(r = 255, g = 255, b = 255, a = 255) {
		this.r = boundNumber(r, 0, 255);
		this.g = boundNumber(g, 0, 255);
		this.b = boundNumber(b, 0, 255);
		this.a = boundNumber(a, 0, 255);
	}

	/** Convert this color to a six or eight digit hex color. */
	get hex(): string {
		return `#${_hex(this.r)}${_hex(this.g)}${_hex(this.b)}${this.a < 255 ? _hex(this.a) : ""}`;
	}

	/** Convert this color to an `rgb()` string. */
	get rgb(): string {
		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}

	/** Convert this color to an `rgba()` string. */
	get rgba(): string {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${roundNumber(this.a / 256, 4)})`;
	}

	/** Get the sRGB luminance of this color. */
	get luminance(): number {
		// Green is the largest component of the luminence, etc.
		return Math.round(0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b);
	}

	/** Is this color light. */
	get isLight(): boolean {
		return this.luminance > DARK;
	}

	/** Is this color dark. */
	get isDark(): boolean {
		return this.luminance <= DARK;
	}

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

/** Is an unknown value a `Color` instance. */
export function isColor(value: unknown): value is Color {
	return value instanceof Color;
}

/** Assert that an unknown value is a `Color` instance. */
export function assertColor(value: unknown, caller: AnyCaller = assertColor): asserts value is Color {
	if (!isColor(value)) throw new RequiredError("Must be color", { received: value, caller });
}

/** Convert an unknown value to a `Color` instance, or return `undefined` if conversion fails. */
export function getColor(value: unknown): Color | undefined {
	return Color.from(value);
}

/** Convert a possible color to a `Color` instance, or throw `RequiredError` if it can't be converted. */
export function requireColor(value: PossibleColor, caller: AnyCaller = requireColor): Color {
	const color = getColor(value);
	assertColor(color, caller);
	return color;
}
