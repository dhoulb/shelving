import { RequiredError } from "../../error/RequiredError.js";
import type { DataSchema } from "../../schema/DataSchema.js";
import { Schema } from "../../schema/Schema.js";
import { DataStore } from "../../store/DataStore.js";
import { DictionaryStore } from "../../store/DictionaryStore.js";
import type { Data, DataKey } from "../../util/data.js";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import { awaitDispose } from "../../util/dispose.js";
import { splitMessage } from "../../util/error.js";
import type { Arguments } from "../../util/function.js";
import { getRandomKey } from "../../util/random.js";

/** Store the current value of a form. */
export class FormStore<T extends Data> extends DataStore<Partial<T>> implements AsyncDisposable {
	/** Unique ID for the form. */
	readonly id = getRandomKey();

	/** Key used for mounting the form */
	readonly key: string;

	/** Schema for the current form. */
	readonly schema: DataSchema<T>;

	/**
	 * Store named error messages for individual fields.
	 * - Throwing a string triggers changes in this.
	 * - Rows prefixed with `fieldName:` are shown on those specific fields.
	 * - See `splitMessages()` in `shelving` for more information.
	 */
	readonly messages = new DictionaryStore<string>();

	/** Get the current valid value for this form (throws string for invalid values). */
	get validated(): T {
		return (this.value = this.schema.validate(this.value));
	}

	override get reason(): unknown {
		return super.reason;
	}
	override set reason(reason: unknown) {
		if (typeof reason === "string") {
			this.messages.value = splitMessage(reason);
			super.reason = undefined;
		} else {
			super.reason = reason;
		}
	}

	constructor(schema: DataSchema<T>, partialData: Partial<T> = {}, messages?: ImmutableDictionary<string> | string | undefined) {
		super(partialData);
		this.key = `${this.id}:${JSON.stringify(partialData)}`;
		this.schema = schema;
		if (messages) this.messages.value = typeof messages === "string" ? splitMessage(messages) : messages;
	}

	/** Get a named schema for a field of this form. */
	requireSchema<K extends DataKey<T>>(name: K): Schema<T[K]> {
		const schema = this.schema.props[name];
		if (schema instanceof Schema) return schema as Schema<T[K]>;
		throw new RequiredError(`Schema "${name}" does not exist in form`, { received: name, caller: this.requireSchema });
	}

	/** Publish a value for a field of this form. */
	publish<K extends DataKey<T>>(name: K, unsafeValue: T[K]): void {
		this.abort();

		// Clear main message and this named message.
		this.messages.delete("");
		this.messages.delete(name);

		try {
			const value = this.requireSchema(name).validate(unsafeValue);
			this.set(name, value);
		} catch (thrown) {
			if (typeof thrown === "string") this.messages.set(name, thrown);
			else this.reason = thrown;

			// Save the value _even if_ it didn't validate so it's persisted.
			// Everything gets validated before submit.
			this.set(name, unsafeValue);
		}
	}

	/**
	 * Validate and submit the current values of the form.
	 *
	 * @param callback Optional callback that takes the current (validated) value of the form, processes it (possibly asynchronously) and returns any new values.
	 */
	submit<A extends Arguments>(callback?: ((value: T, ...args: A) => void) | undefined, ...args: A): boolean | Promise<boolean> {
		try {
			const value = this.validated;
			if (callback) return this.run(callback, value, ...args);
			return true;
		} catch (thrown) {
			this.reason = thrown;
			return false;
		}
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.messages, // Dispose of messages store.
			super[Symbol.asyncDispose](),
		);
	}
}
