import { Validator, dispatchError, validate } from "../util/index.js";
import { AbstractStream } from "./AbstractStream.js";

/** Stream that validates its values using a validator. */
export class ValidateStream<T> extends AbstractStream<unknown, T> {
	private _validator: Validator<T>;
	constructor(deriver: Validator<T>) {
		super();
		this._validator = deriver;
	}

	// Override to derive any received values using the `Deriver` function and send them to the `DISPATCH_DERIVED()` method.
	protected override _derive(value: unknown): void {
		try {
			this._dispatch(validate(value, this._validator));
		} catch (thrown) {
			dispatchError(thrown, this);
		}
	}
}
