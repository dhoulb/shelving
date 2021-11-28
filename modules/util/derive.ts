import type { Entry } from "./entry.js";
import type { ArrayType, ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import { ImmutableObject } from "./object.js";
import { isAsync } from "./promise.js";
import { isFunction } from "./function.js";
import { Data, Value, Prop, toProps, isData } from "./data.js";
import { IterationWatcher } from "./iterable.js";

/** Object that can derive a value with its `derive()` method. */
export interface Derivable<I, O = I> {
	derive(input: I): O;
}

/** Any derivable (useful for `extends AnyDeriver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDerivable = Derivable<any, any>;

/** Function that takes an input value and returns a value derived from it. */
export type Deriver<I, O = I> = Derivable<I, O> | ((input: I) => O) | O;

/** Any deriver (useful for `extends AnyDeriver` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDeriver = Deriver<any, any>;

/** Extract the derived type from a deriver. */
export type DerivedType<T extends AnyDeriver> = T extends Deriver<unknown, infer TT> ? TT : never;

/** Is an unknown value a deriver. */
export const isDeriver = <T extends AnyDeriver>(v: T | unknown): v is T => typeof v === "function" || isDerivable(v);

/** Is an unknown value a derivable. */
export const isDerivable = <T extends AnyDerivable>(v: T | unknown): v is T => isData(v) && typeof v.derive === "function";

/** Derive a value using a deriver. */
export function derive<I, O>(input: I, deriver: (v: I) => O): O; // Helps `O` carry through functions that use generics.
export function derive<I, O>(input: I, deriver: Deriver<I, O>): O; // No promise returned with synchronous deriver.
export function derive<I, O>(input: I, deriver: Deriver<I, O>): O {
	return isFunction(deriver) ? deriver(input) : isDerivable(deriver) ? deriver.derive(input) : deriver;
}

/** Await a promised value then derive it using a deriver. */
export function deriveAsync<I, O>(input: I | Promise<I>, deriver: (v: I) => O): O | Promise<O>; // Helps `O` carry through functions that use generics.
export function deriveAsync<I, O>(input: I | Promise<I>, deriver: Deriver<I, O>): O | Promise<O>; // Promise returned with asynchronous input or deriver.
export function deriveAsync<I, O>(input: I | Promise<I>, deriver: Deriver<I, O>): O | Promise<O> {
	return isAsync(input) ? _awaitDerived(input, deriver) : derive(input, deriver);
}
async function _awaitDerived<I, O>(asyncInput: Promise<I>, deriver: Deriver<I, O>): Promise<O> {
	return derive(await asyncInput, deriver);
}

/**
 * Apply a deriver to each item in a set of items and yield the derived item.
 *
 * @yield Derived items after calling `deriver()` on each.
 * @returns Number of items that changed.
 */
export function deriveItems<I, O>(items: Iterable<I>, deriver: (input: I) => O): Iterable<O>; // Helps `O` carry through functions that use generics.
export function deriveItems<I, O>(items: Iterable<I>, deriver: Deriver<I, O>): Iterable<O>;
export function* deriveItems<I, O>(items: Iterable<I>, deriver: Deriver<I, O>): Iterable<O> {
	for (const item of items) yield derive(item, deriver);
}

/**
 * Apply a deriver to each item in an array and return the derived array.
 *
 * @param arr The input array or map-like object or iterable to iterate over.
 * @param mapper Mapping function that receives the value and key and returns the corresponding value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a non-function static value and all the values will be set to that value.
 *
 * @return The mapped array.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function deriveArray<T extends ImmutableArray>(arr: T, deriver: Deriver<ArrayType<T>, ArrayType<T>>): T; // Passthrough for derivers that return the same type and remove nothing.
export function deriveArray<I, O>(arr: Iterable<I>, deriver: (v: I) => O): ImmutableArray<O>; // Helps `O` carry through functions that use generics.
export function deriveArray<I, O>(arr: Iterable<I>, deriver: Deriver<I, O>): ImmutableArray<O>;
export function deriveArray<I, O>(arr: Iterable<I>, deriver: Deriver<I, O>): ImmutableArray<O> {
	return Array.from(deriveItems(arr, deriver));
}

/**
 * Derive the _values_ of a set of entries using a deriver.
 * @yield Derived entry after calling deriving the new value for each entry.
 */
export function deriveValues<I, O>(entries: Iterable<Entry<I>>, deriver: (v: I) => O): Iterable<Entry<O>>; // Helps `O` carry through functions that use generics.
export function deriveValues<I, O>(entries: Iterable<Entry<I>>, deriver: Deriver<I, O>): Iterable<Entry<O>>;
export function* deriveValues<I, O>(entries: Iterable<Entry<I>>, deriver: Deriver<I, O>): Iterable<Entry<O>> {
	for (const [k, v] of entries) yield [k, derive(v, deriver)];
}

/**
 * Derive the _values_ of a map using a deriver.
 * @return New map after deriving its values.
 */
export function deriveMap<I, O>(obj: ImmutableMap<I>, deriver: (v: I) => O): ImmutableMap<O>; // Helps `O` carry through functions that use generics.
export function deriveMap<I, O>(obj: ImmutableMap<I>, deriver: Deriver<I, O>): ImmutableMap<O>;
export function deriveMap<I, O>(obj: ImmutableMap<I>, deriver: Deriver<I, O>): ImmutableMap<O> {
	return new Map(deriveValues(obj, deriver));
}

/**
 * Derive the _values_ of an object using a deriver.
 * @return New object after deriving its entries.
 */
export function deriveObject<T extends Data>(obj: T, deriver: Deriver<Value<T>, Value<T>>): T; // Passthrough for derivers that return the same type and remove nothing.
export function deriveObject<I extends Data, O extends { [K in keyof I]: unknown }>(obj: I, deriver: Deriver<Value<I>, Value<O>>): O; // Derive an entire object with the same props with different types.
export function deriveObject<I, O>(obj: ImmutableObject<I>, deriver: (v: I) => O): ImmutableObject<O>; // Helps `O` carry through functions that use generics.
export function deriveObject<I, O>(obj: ImmutableObject<I>, deriver: Deriver<I, O>): ImmutableObject<O>;
export function deriveObject<I, O>(obj: ImmutableObject<I>, deriver: Deriver<I, O>): ImmutableObject<O> {
	return Object.fromEntries(deriveValues(Object.entries(obj), deriver));
}

/** Set of named derivers for a data object. */
export type Derivers<T extends Data> = { readonly [K in keyof T]?: Deriver<T[K]> };

/** Complete set of named derivers for a data object (i.e. every prop has a deriver specified). */
export type RequiredDerivers<T extends Data> = { readonly [K in keyof T]: Deriver<T[K]> };

/**
 * Derive the props of a data object using a set of transforms.
 * @yields Valid new prop entries for the data object (only changed values are yielded).
 */
export function* deriveProps<T extends Data>(existing: T, transforms: Derivers<T>): Generator<Prop<T>, void> {
	for (const [k, v] of toProps<RequiredDerivers<T>>(transforms)) {
		const current = existing[k];
		const derived = derive<Value<T>, Value<T>>(current, v);
		if (derived !== current) yield [k, derived];
	}
}

/**
 * Derive a new data object using a set of derivers for its props.
 * @returns New object with changed props (or the same object if no changes were made).
 */
export function deriveData<T extends Data>(existing: T, transforms: Derivers<T>): T {
	const watcher = new IterationWatcher(deriveProps(existing, transforms));
	const derived = Object.fromEntries(watcher);
	return watcher.count ? { ...existing, ...derived } : existing;
}
