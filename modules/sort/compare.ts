/** Allowed direction references for sorting. */
export type Direction = "asc" | "desc";

/**
 * Comparer: a function that takes in a value and returns zero if the values are equal, negative if `right` is higher, positive if `right` is lower).
 * - Consistent with: `Dispatcher`, `Deriver`, `Searcher`, `Comparer`, `Matcher`
 */
export type Comparer<T = unknown> = (left: T, right: T) => number;

/**
 * Comparison function that sorts into ascending order in a pragmatic way.
 * A sorting compare algorithm that can compare and order values of different types in a sensible manner.
 *
 * 1. Numbers and dates (ascending order: -Infinity, negative, zero, positive, Infinity, NaN)
 * 2. Strings (locale-aware order)
 * 3. `true`
 * 4. `false`
 * 5. `null`
 * 6. Unsorted values (objects that can't be converted to number or string, symbols, NaN, etc)
 * 7. `undefined`
 *
 * @param x The first value to compare.
 * @param y The second value to compare.
 *
 * @returns Number below zero if `a` is higher, number above zero if `b` is higher, or `0` if they're equally sorted.
 */
const asc: Comparer = (left, right) => {
	// Exactly equal is easy.
	if (left === right) return 0;

	// Switch for type.
	if (typeof left === "number" && !Number.isNaN(left)) {
		// Number compare.
		if (typeof right === "number" && !Number.isNaN(right) && right < left) return 1;
	} else if (typeof left === "string") {
		// String compare (uses locale-aware comparison).
		if (typeof right === "string") return left.localeCompare(right);
		// right is higher if number.
		else if (typeof right === "number") return 1;
	} else if (left === true) {
		// right is higher if number, string.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string") return 1;
	} else if (left === false) {
		// right is higher if number, string.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || right === true) return 1;
	} else if (left === null) {
		// right is higher if number, string, boolean.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || typeof right === "boolean") return 1;
	} else if (typeof left !== "undefined") {
		// Anything else, e.g. object, array, symbol, NaN.
		// right is higher if number, string, boolean, null.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || typeof right === "boolean" || right === null) return 1;
		// Undefined is lower, anything else is equal.
		else if (typeof right !== "undefined") return 0;
	} else {
		// Both undefined.
		if (typeof right === "undefined") return 0;
		// right is higher if not undefined
		return 1;
	}

	// Otherwise a is higher.
	return -1;
};

// To compare in descending order just invert the ascending order.
const desc: Comparer = (left, right) => 0 - asc(left, right);

/** List of matching functions along with their string direction reference. */
export const COMPARE: {
	readonly [K in Direction]: Comparer;
} = {
	asc,
	desc,
};
