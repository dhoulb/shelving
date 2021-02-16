import type { PolymorphicSubscriptor } from "../function";

/**
 * Subscribable is a class that has:
 * - `on()` methods that implements `PolymorphicSubscriptor`
 */
export interface Subscribable<T> {
	subscribe: PolymorphicSubscriptor<T>;
}
