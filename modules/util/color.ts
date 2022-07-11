import { AssertionError } from "../error/AssertionError.js";
import { getBetween, roundNumber } from "./number.js";

// Constants.
const DARK = 140; // Anything with a luminance > 140 is considered light.
const MIN = 0; // Maximum value of a channel.
const MAX = 255; // Maximum value of a channel.

// Regular expressions.
const HEX3 = /^#?([0-F])([0-F])([0-F])$/i;
const HEX6 = /^#?([0-F]{2})([0-F]{2})([0-F]{2})([0-F]{2})?$/i;

/** Things that can be converted to a `Color` instance. */
export type PossibleColor = Color | string;
export type PossibleOptionalColor = PossibleColor | null;

/** Represent a color. */
export class Color {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
	constructor(r: number | string = 255, g: number | string = 255, b: number | string = 255, a: number | string = 255) {
		this.r = getColorChannel(r);
		this.g = getColorChannel(g);
		this.b = getColorChannel(b);
		this.a = getColorChannel(a);
	}

	/** Convert this color to a six or eight digit hex color. */
	get hex(): string {
		return `#${_hex(this.r)}${_hex(this.g)}${_hex(this.b)}${this.a < MAX ? _hex(this.a) : ""}`;
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

	toString() {
		return this.rgba;
	}
}

/** Convert number channel to a hex string (results will be unpredictable if number is outside 0-MAX). */
const _hex = (channel: number) => channel.toString(16).padStart(2, "00");

/** Is an unknown value a `Color` instance. */
export const isColor = (v: Color | unknown): v is Color => v instanceof Color;

/** Assert that an unknown value is a `Color` instance. */
export function assertColor(v: Color | unknown): asserts v is Color {
	if (!isColor(v)) throw new AssertionError("Invalid color", v);
}

/** Convert a number or string to a color channel number that's within bounds (strings like `0a` or `ff` are parsed as hexadecimal). */
export function getColorChannel(channel: number | string): number {
	const num = typeof channel === "string" ? parseInt(channel.padStart(2, "00"), 16) : Math.round(channel);
	if (Number.isFinite(num)) return getBetween(num, MIN, MAX);
	throw new AssertionError("Invalid color channel", channel);
}

/** Convert a possible color to a `Color` instance or `null` */
export function getOptionalColor(possibleColor: unknown): Color | null {
	if (possibleColor instanceof Color) return possibleColor;
	if (typeof possibleColor === "string") {
		const hex3 = possibleColor.match(HEX3);
		if (hex3) return new Color(hex3[1], hex3[2], hex3[3]);
		const hex6 = possibleColor.match(HEX6);
		if (hex6) return new Color(hex6[1], hex6[2], hex6[3], hex6[4]);
	}
	return null;
}

/** Convert a possible color to a `Color` instance */
export function getColor(possibleColor: PossibleColor): Color {
	const color = getOptionalColor(possibleColor);
	assertColor(color);
	return color;
}

/** Is a color light? */
export const isLight = (input: PossibleColor): boolean => getColor(input).luminance > DARK;

/** Is a color dark? */
export const isDark = (input: PossibleColor): boolean => getColor(input).luminance <= DARK;
