import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";

/** Data object. */
export type Data = { readonly [key: string]: unknown };

/** Data or `null` to indicate the data doesn't exist. */
export type OptionalData<T extends Data> = T | null;

/** Empty data object. */
export type EmptyData = { readonly [K in never]: never };

/** Key for a prop in a data object. */
export type Key<T extends Data> = keyof T & string;

/** Value for a prop in a data object. */
export type Value<T extends Data> = T[Key<T>];

/** Prop of a data object in entry format. */
export type Prop<T extends Data> = readonly [Key<T>, Value<T>];

/** Set of named data objects. */
export type Datas = { readonly [key: string]: Data };

/** Is an unknown value a data object? */
export const isData = <T extends Data>(value: T | unknown): value is T => typeof value === "object" && value !== null;

/** Turn a data object into an array of props. */
export function getProps<T extends Data>(data: T): ImmutableArray<Prop<T>>;
export function getProps<T extends Data>(data: Partial<T>): ImmutableArray<Prop<T>>;
export function getProps<T extends Data>(data: T | Partial<T>): ImmutableArray<Prop<T>> {
	return Object.entries(data) as ImmutableArray<Prop<T>>;
}

/** Get the data of a result (returns data or throws `RequiredError` if value is `null` or `undefined`). */
export function getData<T extends Data>(result: OptionalData<T>): T {
	if (!result) throw new RequiredError("Data is required");
	return result;
}

/**
 * Extract the value of a named prop from a data object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param k1 The key of the prop in the object to get.
 * @param k2 The sub-key of the prop in the object to get.
 * @param k3 The sub-sub-key of the prop in the object to get.
 * @param k4 The sub-sub-sub-key of the prop in the object to get.
 */
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(obj: T, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4];
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(obj: T, k1: K1, k2: K2, k3: K3): T[K1][K2][K3];
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1]>(obj: T, k1: K1, k2: K2): T[K1][K2];
export function getProp<T extends Data, K1 extends keyof T>(obj: T, k1: K1): T[K1];
export function getProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	data: T,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return !k2 ? data[k1] : !k3 ? data[k1][k2] : !k4 ? data[k1][k2][k3] : data[k1][k2][k3][k4];
}

/**
 * Set a prop on a data object with known shape (immutably).
 *
 * @param data The input data object.
 * @param key The key of the entry to add.
 * @param value The value of the entry to add. If set, the entry will only be added if its current value is not `value`
 *
 * @return New object without the specified prop (or same object if prop value didn't change).
 */
export function withProp<T extends Data, K extends Key<T>>(data: T, key: K, value: T[K]): T {
	return data[key] === value ? data : { ...data, [key]: value };
}

/**
 * Set several props on a data object with known shape (immutably).
 *
 * @param data The input data object.
 * @return New object with the specified prop added (or same object if no props changed).
 */
export function withProps<T extends Data>(data: T, props: T | Partial<T>): T {
	for (const [k, v] of Object.entries(props)) if (data[k] !== v) return { ...data, ...props };
	return data;
}

/**
 * Set a single named prop on an object with a known shape (by reference).
 *
 * @param data The target data object to modify.
 * @param key The key of the prop in the object to set.
 * @param value The value to set the prop to.
 */
export function setProp<T extends Data, K extends keyof T>(data: T, key: K, value: T[K]): T[K] {
	data[key] = value;
	return value;
}

/**
 * Set several named props on a data object with a known shape (by reference).
 *
 * @param data The target data object to modify.
 * @param props An object containing new props to set on the object.
 */
export function setProps<T extends Data>(data: T, props: { [K in keyof T]?: T[K] }): void {
	for (const [k, v] of getProps<T>(props)) data[k] = v;
}

/**
 * Mutable type is the opposite of `Readonly<T>` helper type.
 * - See https://github.com/microsoft/TypeScript/issues/24509
 * - Consistency with `Readonly<T>`
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Deep partial object: deeply convert an object to its partial version.
 * - Any value that extends `Data` has its props made partial.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepPartial<T extends Data> = { [K in keyof T]?: T[K] extends Data ? DeepPartial<T[K]> : T[K] };

/**
 * Deep mutable object: deeply convert an object to its mutable version.
 * - Any value that extends `Data` has its props made mutable.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepMutable<T extends Data> = { -readonly [K in keyof T]: T[K] extends Data ? DeepMutable<T[K]> : T[K] };

/**
 * Deep readonly object: deeply convert an object to its readonly version.
 * - Any value that extends `Data` has its props made readonly.
 * - Works deeply on nested objects too.
 * - Only works for plain objects (i.e. objects that extend `Data`), not arrays and functions.
 */
export type DeepReadonly<T extends Data> = { +readonly [K in keyof T]: T[K] extends Data ? DeepReadonly<T[K]> : T[K] };

/** Pick only the properties of an object that match a type. */
export type PickProps<T, TT> = Pick<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/** Omit the properties of an object that match a type. */
export type OmitProps<T, TT> = Omit<T, { [K in keyof T]: T[K] extends TT ? K : never }[keyof T]>;

/**
 * Format a data object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 */
export function formatData(data: Data): string {
	const { toString, name, title, id } = data;
	if (typeof toString === "function" && toString !== Object.prototype.toString) return data.toString();
	if (typeof name === "string") return name;
	if (typeof title === "string") return title;
	if (typeof id === "string") return id;
	return "Object";
}
