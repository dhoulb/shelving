import { wrapNumber } from "./number.js";

/** Hash a string into an idempotent number. */
export function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
	return hash;
}

/** Hash a string into an idempotent number between two values. */
export function hashStringBetween(str: string, min = 0, max = 256): number {
	return wrapNumber(hashString(str), min, max);
}
