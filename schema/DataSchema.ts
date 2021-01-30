import { Data, EmptyObject, Change, ReadonlyObject, mapObject, Changes, Results } from "shelving/tools";
import { MapSchema } from "./MapSchema";
import { ObjectSchema } from "./ObjectSchema";
import { withUndefined } from "./undefined";
import { Validator, Validators } from "./Validator";
import { SchemaOptions } from ".";

/** A generic data schema whose values are not known. */
export type UnknownDataSchema = DataSchema<Data, DataSchemas, DataSchemas>;

/** A set of named data schemas whose values are not known. */
export type DataSchemas = ReadonlyObject<UnknownDataSchema>;

export type DataOptions<T extends Data, D extends DataSchemas, C extends DataSchemas> = Exclude<SchemaOptions, "required"> & {
	props: Validators<T>;
	documents?: D;
	collections?: C;
};

/**
 * Data schema: an extension of `ObjectSchema` that...
 * - Only allows `Data` as its type.
 * - Never allows `null` (i.e. is always required).
 * - Accepts `options.documents` and `options.collections` to define data nested under it.
 * - Has `.partial`, `.change`, `.results`, `.changes` props that create schemas (based off this) that allow `undefined` in the right places.
 */
export class DataSchema<T extends Data, D extends DataSchemas, C extends DataSchemas> extends ObjectSchema<T> {
	/** Type (exposed so we can easily reuse T). */
	readonly DATA!: T;

	/** Any nested documents that sit below this data. */
	readonly documents: D;

	/** Any nested collections that sit below this data. */
	readonly collections: C;

	constructor({ props = {} as Validators<T>, documents = {} as D, collections = {} as C, ...rest }: DataOptions<T, D, C>) {
		super({ ...rest, props, required: true, value: {} });
		this.documents = documents;
		this.collections = collections;
	}

	/** Get a change validator for this object (i.e. object itself or its props can be `undefined`, and where `undefined` means delete). */
	get change(): Validator<Change<T>> {
		// Lazy created.
		return (this._change ||= withChange(this));
	}
	private _change?: Validator<Change<T>>;

	/** Schema that validates collection results at this locus. */
	get results(): MapSchema<Results<T>> {
		// Lazy created.
		return (this._results ||= new MapSchema<Results<T>>({ items: this }));
	}
	private _results?: MapSchema<Results<T>>;

	/** Schema that validates collection changes at this locus. */
	get changes(): MapSchema<Changes<T>> {
		// Lazy created.
		return (this._changes ||= new MapSchema<Changes<T>>({ items: withUndefined(this.change) }));
	}
	private _changes?: MapSchema<Changes<T>>;
}

/**
 * Modify an input MapSchema or ObjectSchema schema to make it allow partial object props.
 * - i.e. if schema validates an object, all props of that object can be their normal value _or_ `undefined`.
 * - If schema does not validate an object (i.e. it's not an `ObjectSchema` or `MapSchema`) then it won't be modified.
 * - Works deeply, so nested `ObjectSchema` or `MapSchemas` under the input schema will also allow partial object props.
 */
const withChange = <T>(schema: Validator<T>): Validator<Change<T & Data>> => {
	// If schema is an ObjectSchema, modify its props option so each of them is partial and undefined.
	if (schema instanceof ObjectSchema)
		return new ObjectSchema<Change<T & Data>>({ props: mapObject(schema.props, withChangeOrUndefined) as Validators<Change<T & Data>> });
	// If schema is an MapSchema, modify its items option so it is partial and undefined.
	if (schema instanceof MapSchema) return new MapSchema<Change<T & Data>>({ items: withChangeOrUndefined(schema.items) });
	// Else return the unmodified schema.
	return schema;
};

/** Modify an input schema to make it allow to be undefined and allow partial object props. */
const withChangeOrUndefined = <T>(schema: Validator<T>): Validator<T | Change<T & Data> | undefined> => withUndefined(withChange(schema));

/** Shortcuts for DataSchema. */
export const data: {
	<T extends Data = EmptyObject, D extends DataSchemas = EmptyObject, C extends DataSchemas = EmptyObject>(
		options: Partial<DataOptions<T, D, C>>,
	): DataSchema<T, D, C>;
} = <T extends Data, D extends DataSchemas, C extends DataSchemas>(options: Partial<DataOptions<T, D, C>>): DataSchema<T, D, C> =>
	new DataSchema(options as DataOptions<T, D, C>);
