import { isObject } from "../object";
import type { PolymorphicSubscriptor } from "../function";

/**
 * Subscribable is any class that has:
 * - `subscribe()` methods that implements `PolymorphicSubscriptor`
 */
export interface Subscribable<T> {
	subscribe: PolymorphicSubscriptor<T>;
}

/** Is an unknown object an object implementing `Subscribable` */
export const isSubscribable = <T extends Subscribable<unknown>>(value: T | unknown): value is T => isObject(value) && typeof value.subscribe === "function";
