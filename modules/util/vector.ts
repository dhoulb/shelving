import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import type { AnyCaller } from "./function.js";
import { isPlainObject } from "./object.js";
import { simplifyString } from "./string.js";

/**
 * A vector of numbers, for example a text embedding, stored as a `Float32Array`.
 * - Float32 keeps about 7 significant digits, which is more than search needs, in 4 bytes per number.
 * - `JSON.stringify()` turns a `Float32Array` into an object like `{"0":0.1,"1":-0.2}`. That loses nothing, and `getVectorArray()` reads it back.
 *
 * @see https://shelving.cc/util/vector/VectorArray
 */
export type VectorArray = Float32Array;

/**
 * A value that `getVectorArray()` can turn into a `VectorArray`.
 *
 * @see https://shelving.cc/util/vector/PossibleVectorArray
 */
export type PossibleVectorArray = VectorArray | ImmutableArray<number> | { readonly [index: string]: number };

/**
 * Is an unknown value a `VectorArray` (optionally with an exact size)?
 *
 * @param value The value to check.
 * @param size The exact number of items the vector must have, or `undefined` for any size.
 * @returns `true` if the value is a `Float32Array` of that size.
 * @example isVectorArray(new Float32Array(3), 3) // true
 * @see https://shelving.cc/util/vector/isVectorArray
 */
export function isVectorArray(value: unknown, size?: number): value is VectorArray {
	return value instanceof Float32Array && (size === undefined || value.length === size);
}

/**
 * Assert that an unknown value is a `VectorArray` (optionally with an exact size).
 *
 * @param value The value to check.
 * @param size The exact number of items the vector must have, or `undefined` for any size.
 * @throws {RequiredError} If the value is not a `Float32Array` of that size.
 * @see https://shelving.cc/util/vector/assertVectorArray
 */
export function assertVectorArray(value: unknown, size?: number, caller: AnyCaller = assertVectorArray): asserts value is VectorArray {
	if (!isVectorArray(value, size)) throw new RequiredError(_getMessage(size), { received: value, caller });
}

/**
 * Get a `VectorArray` from a possible vector, or `undefined` if the value is not one.
 * - A `Float32Array` is returned as it is.
 * - An array of finite numbers becomes a new `Float32Array`.
 * - An object whose keys are `"0"` to `"n-1"` with finite number values (what `JSON.stringify()` makes of a `Float32Array`) becomes a new `Float32Array`.
 *
 * @param value The value to convert.
 * @param size The exact number of items the vector must have, or `undefined` for any size.
 * @returns The vector, or `undefined` if the value is not a vector of that size.
 * @example getVectorArray([0.5, -0.5]) // Float32Array [0.5, -0.5]
 * @see https://shelving.cc/util/vector/getVectorArray
 */
export function getVectorArray(value: unknown, size?: number): VectorArray | undefined {
	if (value instanceof Float32Array) return size === undefined || value.length === size ? value : undefined;
	if (isArray(value)) return _getVectorFromNumbers(value, size);
	if (isPlainObject(value)) {
		const keys = Object.keys(value);
		const numbers: unknown[] = [];
		for (let i = 0; i < keys.length; i++) {
			if (!(i.toString() in value)) return undefined;
			numbers.push((value as { readonly [index: string]: unknown })[i.toString()]);
		}
		return _getVectorFromNumbers(numbers, size);
	}
	return undefined;
}

/**
 * Get a `VectorArray` from a possible vector, or throw if the value is not one.
 *
 * @param value The value to convert (see `getVectorArray()` for the shapes it takes).
 * @param size The exact number of items the vector must have, or `undefined` for any size.
 * @returns The vector.
 * @throws {RequiredError} If the value is not a vector of that size.
 * @see https://shelving.cc/util/vector/requireVectorArray
 */
export function requireVectorArray(value: unknown, size?: number, caller: AnyCaller = requireVectorArray): VectorArray {
	const vector = getVectorArray(value, size);
	if (!vector) throw new RequiredError(_getMessage(size), { received: value, caller });
	return vector;
}

/**
 * Get the length (magnitude) of a vector.
 *
 * @param vector The vector to measure.
 * @returns The square root of the sum of the squares of its numbers.
 * @see https://shelving.cc/util/vector/getVectorLength
 */
export function getVectorLength(vector: VectorArray): number {
	let sum = 0;
	for (const n of vector) sum += n * n;
	return Math.sqrt(sum);
}

/**
 * Get a vector scaled to length 1, so the dot product of two unit vectors is their cosine similarity.
 * - A vector of all zeros has no direction, so it is returned as it is.
 *
 * @param vector The vector to scale.
 * @returns A new vector of length 1, or the input when it is all zeros.
 * @example getUnitVector(new Float32Array([3, 4])) // Float32Array [0.6, 0.8]
 * @see https://shelving.cc/util/vector/getUnitVector
 */
export function getUnitVector(vector: VectorArray): VectorArray {
	const length = getVectorLength(vector);
	return length ? getScaledVector(vector, 1 / length) : vector;
}

/**
 * Get a vector with every number multiplied by a weight.
 *
 * @param vector The vector to scale.
 * @param weight The number to multiply by.
 * @returns A new vector, or the input when the weight is 1.
 * @see https://shelving.cc/util/vector/getScaledVector
 */
export function getScaledVector(vector: VectorArray, weight: number): VectorArray {
	if (weight === 1) return vector;
	const scaled = new Float32Array(vector.length);
	for (let i = 0; i < vector.length; i++) scaled[i] = (vector[i] ?? 0) * weight;
	return scaled;
}

/**
 * Join several vectors and single numbers into one longer vector, in order.
 * - The dot product of two joined vectors is the sum of the dot products of their parts. So one comparison can score several things at once (for example meaning, words, and popularity), and the weights of the parts set the balance.
 *
 * @param parts The vectors and numbers to join.
 * @returns A new vector with every part's numbers in order.
 * @example mergeVectors(new Float32Array([1, 2]), 3) // Float32Array [1, 2, 3]
 * @see https://shelving.cc/util/vector/mergeVectors
 */
export function mergeVectors(...parts: ImmutableArray<VectorArray | number>): VectorArray {
	let size = 0;
	for (const part of parts) size += typeof part === "number" ? 1 : part.length;
	const merged = new Float32Array(size);
	let i = 0;
	for (const part of parts) {
		if (typeof part === "number") merged[i++] = part;
		else {
			merged.set(part, i);
			i += part.length;
		}
	}
	return merged;
}

/**
 * Get the dot product of two vectors: the sum of their numbers multiplied in pairs.
 * - For two unit vectors (see `getUnitVector()`) this is their cosine similarity: 1 is the same direction, 0 is unrelated.
 * - Missing numbers in the shorter vector count as zero.
 *
 * @param left The first vector.
 * @param right The second vector.
 * @returns The dot product.
 * @example getDotProduct(new Float32Array([1, 2]), new Float32Array([3, 4])) // 11
 * @see https://shelving.cc/util/vector/getDotProduct
 */
export function getDotProduct(left: VectorArray, right: VectorArray): number {
	const size = Math.min(left.length, right.length);
	let sum = 0;
	for (let i = 0; i < size; i++) sum += (left[i] ?? 0) * (right[i] ?? 0);
	return sum;
}

/**
 * Get a cheap vector of the words in a text, with no AI model.
 * - Simplifies the text (see `simplifyString()`), then hashes each word, and each three-letter piece of each word, into one of `size` slots, and scales the result to length 1.
 * - So texts that share words, or parts of words, get similar vectors: `cool dan` is close to `cooldan94`, and `runn` is close to `running`.
 * - It does not know meaning: `hills` is not close to `incline`. Use an embedding model when meaning matters.
 * - The same text and size always give the same vector.
 *
 * @param text The text to turn into a vector.
 * @param size The number of slots. Fewer slots means more unrelated pieces share a slot.
 * @returns A unit vector, or all zeros for a text with no letters or numbers.
 * @example getDotProduct(getWordVector("cool dan"), getWordVector("cooldan94")) // About 0.4
 * @see https://shelving.cc/util/vector/getWordVector
 */
export function getWordVector(text: string, size = 256): VectorArray {
	const vector = new Float32Array(size);
	for (const word of simplifyString(text).split(" ")) {
		if (!word) continue;
		_addSlot(vector, `w:${word}`);
		const padded = `^${word}$`;
		for (let i = 0; i + 3 <= padded.length; i++) _addSlot(vector, padded.slice(i, i + 3));
	}
	return getUnitVector(vector);
}

/** Add one to the slot a piece of text hashes to. */
function _addSlot(vector: VectorArray, piece: string): void {
	const slot = _hash(piece) % vector.length;
	vector[slot] = (vector[slot] ?? 0) + 1;
}

/** FNV-1a hash of a string, as an unsigned 32-bit number (spreads similar strings across slots, unlike a sum of char codes). */
function _hash(str: string): number {
	let hash = 2166136261;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Make a vector from a list of unknown values, or return `undefined` if any is not a finite number or the size is wrong. */
function _getVectorFromNumbers(values: ImmutableArray<unknown>, size: number | undefined): VectorArray | undefined {
	if (size !== undefined && values.length !== size) return undefined;
	const vector = new Float32Array(values.length);
	for (let i = 0; i < values.length; i++) {
		const n = values[i];
		if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
		vector[i] = n;
	}
	return vector;
}

/** Message for a value that is not a vector of the right size. */
function _getMessage(size: number | undefined): string {
	return size === undefined ? "Must be vector" : `Must be vector with ${size} numbers`;
}
