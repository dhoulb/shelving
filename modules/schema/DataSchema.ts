import { Data, Change } from "../data";
import { EmptyObject, ImmutableObject } from "../object";
import { withUndefined } from "./undefined";
import { MapSchema } from "./MapSchema";
import { ObjectSchema } from "./ObjectSchema";
import { Validators } from "./Validator";
import { SchemaOptions } from "./Schema";

/** A generic data schema whose values are not known. */
export type AnyDataSchema = DataSchema<Data, DataSchemas, DataSchemas>;

/** A set of named data schemas whose values are not known. */
export type DataSchemas = ImmutableObject<AnyDataSchema>;

export type DataOptions<T extends Data, D extends DataSchemas, C extends DataSchemas> = Exclude<SchemaOptions, "required"> & {
	props: Validators<T>;
	documents?: D;
	collections?: C;
	value?: Partial<T>;
};

/**
 * Data schema: an extension of `ObjectSchema` that...
 * - Only allows `Data` as its type.
 * - Never allows `null` (i.e. is always required).
 * - Accepts `options.documents` and `options.collections` to define data nested under it.
 * - Has `.partial`, `.change`, `.results`, `.changes` props that create schemas (based off this) that allow `undefined` in the right places.
 */
export class DataSchema<T extends Data, D extends DataSchemas, C extends DataSchemas> extends ObjectSchema<T> {
	/**
	 * Empty data for this schema.
	 * - Primarily so we can use this as a type, e.g. `typeof schema["data"]`
	 * - The value returns is the result of validating `this.value`, so it might throw `InvalidFeedback` if fields are missing but required.
	 */
	get data(): T {
		return this.validate(this.value);
	}

	/** Any nested documents that sit below this data. */
	readonly documents: D;

	/** Any nested collections that sit below this data. */
	readonly collections: C;

	constructor({ props = {} as Validators<T>, documents = {} as D, collections = {} as C, value = {}, ...rest }: DataOptions<T, D, C>) {
		super({ ...rest, props, required: true, value });
		this.documents = documents;
		this.collections = collections;
	}

	/** Schema that validates a set of results (i.e. as returned by `Collection.get()`) for this data. */
	get results(): MapSchema<T> {
		// Lazy created.
		return (this._results ||= new MapSchema({ items: this }));
	}
	private _results?: MapSchema<T>;

	/** Schema that validates a set of changes (i.e. as provided to `Collection.change()`) for this data. */
	get changes(): MapSchema<Change<T> | undefined> {
		// Lazy created.
		return (this._changes ||= new MapSchema({ items: withUndefined(this.partial) }));
	}
	private _changes?: MapSchema<Change<T> | undefined>;
}

/** Shortcuts for DataSchema. */
export const data: {
	<T extends Data = EmptyObject, D extends DataSchemas = EmptyObject, C extends DataSchemas = EmptyObject>(
		options: Partial<DataOptions<T, D, C>>,
	): DataSchema<T, D, C>;
} = <T extends Data, D extends DataSchemas, C extends DataSchemas>(options: Partial<DataOptions<T, D, C>>): DataSchema<T, D, C> =>
	new DataSchema(options as DataOptions<T, D, C>);
