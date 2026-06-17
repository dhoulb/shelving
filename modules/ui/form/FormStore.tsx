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

/**
 * Reactive store holding the current (possibly partial and invalid) value of a form, plus its field messages.
 * - Extends [`DataStore`](/store/DataStore) with the form's `schema`, per-field error `messages`, and validate/submit helpers.
 * - Assigning a string `reason` splits it into per-field messages rather than a global failure.
 *
 * @example const store = new FormStore(USER_SCHEMA, { name: "Dave" });
 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore
 */
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

	/**
	 * The current value validated against the schema, also written back to `this.value`.
	 *
	 * @throws A `string` validation message if the current value is invalid.
	 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore/validated
	 */
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

	/**
	 * Create a new `FormStore` for a schema, with optional initial data and messages.
	 *
	 * @param schema Schema describing the form's fields.
	 * @param partialData Initial (possibly partial) data for the form.
	 * @param messages Initial messages as a dictionary, or a string with `fieldName:` style lines.
	 * @example new FormStore(USER_SCHEMA, { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore/constructor
	 */
	constructor(schema: DataSchema<T>, partialData: Partial<T> = {}, messages?: ImmutableDictionary<string> | string | undefined) {
		super(partialData);
		this.key = `${this.id}:${JSON.stringify(partialData)}`;
		this.schema = schema;
		if (messages) this.messages.value = typeof messages === "string" ? splitMessage(messages) : messages;
	}

	/**
	 * Get the [`Schema`](/schema/Schema) for a named field of this form.
	 *
	 * @param name Name of the field to look up.
	 * @returns The `Schema` for that field.
	 * @throws [`RequiredError`](/error/RequiredError) if no schema exists for the named field.
	 * @example store.requireSchema("email")
	 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore/requireSchema
	 */
	requireSchema<K extends DataKey<T>>(name: K): Schema<T[K]> {
		const schema = this.schema.props[name];
		if (schema instanceof Schema) return schema as Schema<T[K]>;
		throw new RequiredError(`Schema "${name}" does not exist in form`, { received: name, caller: this.requireSchema });
	}

	/**
	 * Validate and set a value for a named field of this form.
	 * - Clears the main and field messages, then validates and stores the value.
	 * - On a string validation error the message is recorded and the raw value is still persisted.
	 *
	 * @param name Name of the field to update.
	 * @param unsafeValue The unvalidated value to store for the field.
	 * @returns Nothing.
	 * @example store.publish("email", "dave@shax.com")
	 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore/publish
	 */
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
	 * Validate the current form value and run an optional submit callback with it.
	 * - On a validation failure the error is stored as the `reason` and `false` is returned.
	 *
	 * @param callback Optional callback that takes the validated value, processes it (possibly asynchronously) and returns any new values.
	 * @param args Additional arguments forwarded to the callback.
	 * @returns `true` on success, `false` on validation failure (or a `Promise` resolving to one).
	 * @example store.submit(saveUser)
	 * @see https://dhoulb.github.io/shelving/ui/form/FormStore/FormStore/submit
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
