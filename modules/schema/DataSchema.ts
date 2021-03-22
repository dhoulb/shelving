import { Data } from "../data";
import { EmptyObject, ImmutableObject } from "../object";
import { ObjectOptions, ObjectSchema } from "./ObjectSchema";
import type { Validators } from "./Validator";

/** A set of named data schemas whose values are not known. */
export type DataSchemas = ImmutableObject<DataSchema>;

export type DataOptions<T extends Data, D extends DataSchemas, C extends DataSchemas> = ObjectOptions<T> & {
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
export class DataSchema<T extends Data = Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas> extends ObjectSchema<T> {
	/** Any nested documents that sit below this data. */
	readonly documents: D;

	/** Any nested collections that sit below this data. */
	readonly collections: C;

	constructor({ props = {} as Validators<T>, documents = {} as D, collections = {} as C, value = {}, ...rest }: Partial<DataOptions<T, D, C>>) {
		super({ ...rest, props, required: true, value });
		this.documents = documents;
		this.collections = collections;
	}
}

/** Shortcuts for DataSchema. */
export const data: {
	<T extends Data = EmptyObject, D extends DataSchemas = EmptyObject, C extends DataSchemas = EmptyObject>(
		options: Partial<DataOptions<T, D, C>>,
	): DataSchema<T, D, C>;
} = <T extends Data, D extends DataSchemas, C extends DataSchemas>(options: Partial<DataOptions<T, D, C>>): DataSchema<T, D, C> => new DataSchema(options);
