import { Store } from "./Store.js";

/**
 * Store a boolean value.
 * - Any input is coerced to a boolean via `!!input`, so truthy/falsy values are accepted.
 * - Defaults to `false`.
 *
 * @see https://shelving.cc/store/BooleanStore
 */
export class BooleanStore extends Store<boolean, unknown> {
	// Override to set default value to `false`
	constructor(value: boolean = false) {
		super(value);
	}

	// Override to automatically convert to boolean.
	protected override _convert(input: unknown): boolean {
		return !!input;
	}

	// Override for fast equality.
	protected override _equal(a: boolean, b: boolean) {
		return a === b;
	}

	/**
	 * Toggle the current boolean value.
	 *
	 * @example store.toggle(); // `true` becomes `false`, `false` becomes `true`
	 * @see https://shelving.cc/store/BooleanStore/toggle
	 */
	toggle(): void {
		this.value = !this.value;
	}
}
