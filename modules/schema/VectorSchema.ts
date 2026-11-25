import { getVectorArray, type VectorArray } from "../util/vector.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `VectorSchema`.
 *
 * @see https://shelving.cc/schema/VectorSchemaOptions
 */
export interface VectorSchemaOptions extends SchemaOptions {
	/** The exact number of numbers in the vector. */
	readonly size: number;
	/**
	 * Default vector used when the input is `undefined`.
	 * @default A vector of `size` zeros
	 */
	readonly value?: VectorArray | undefined;
}

/**
 * Schema that defines a valid vector of numbers (a `VectorArray`), for example a text embedding.
 *
 * - Coerces with `getVectorArray()`: a `Float32Array`, an array of finite numbers, or the object that `JSON.stringify()` makes of a `Float32Array`.
 * - The vector must have exactly `size` numbers.
 * - It does not scale the vector: a joined vector (see `mergeVectors()`) is not length 1 on purpose.
 *
 * @see https://shelving.cc/schema/VectorSchema
 */
export class VectorSchema extends Schema<VectorArray> {
	declare readonly value: VectorArray;
	readonly size: number;
	constructor({ size, value = new Float32Array(size), ...options }: VectorSchemaOptions) {
		super({ one: "vector", value, ...options });
		this.size = size;
	}
	/**
	 * Validate an unknown value and coerce it to a vector.
	 *
	 * @param unsafeValue Value to validate (defaults to this schema's `value`).
	 * @returns The vector.
	 * @throws `string` if the value is not a vector of `size` numbers.
	 * @example VECTOR(2).validate([0.5, -0.5]); // Returns Float32Array [0.5, -0.5]
	 * @see https://shelving.cc/schema/VectorSchema/validate
	 */
	validate(unsafeValue: unknown = this.value): VectorArray {
		const vector = getVectorArray(unsafeValue, this.size);
		if (!vector) throw `Must be vector with ${this.size} numbers`;
		return vector;
	}
	/** Formats as the number of numbers (e.g. `"768 numbers"`), because the numbers mean nothing to a person. */
	override format(value: VectorArray): string {
		return `${value.length} numbers`;
	}
}

/**
 * Create a `VectorSchema` for a vector of an exact size.
 *
 * Sugar factory for `VectorSchema`.
 *
 * @param size The exact number of numbers in the vector.
 * @example VECTOR(768).validate(embedding);
 * @see https://shelving.cc/schema/VECTOR
 */
export function VECTOR(size: number): VectorSchema {
	return new VectorSchema({ size });
}
