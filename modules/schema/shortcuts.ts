import type { ImmutableObject } from "../object";
import type { Data } from "../data";
import type { Validator, Validators } from "./Validator";
import { Schema } from "./Schema";
import { ArraySchema } from "./ArraySchema";
import { BooleanSchema } from "./BooleanSchema";
import { UrlSchema } from "./UrlSchema";
import { ColorSchema } from "./ColorSchema";
import { PhoneSchema } from "./PhoneSchema";
import { KeySchema } from "./KeySchema";
import { StringSchema } from "./StringSchema";
import { DateSchema } from "./DateSchema";
import { EmailSchema } from "./EmailSchema";
import { MapSchema } from "./MapSchema";
import { NumberSchema } from "./NumberSchema";
import { ObjectSchema } from "./ObjectSchema";

/**
 * Schema shortcuts.
 * - Much nicer to use `schema.string.required` than `new StringSchema()`
 */
export const schema: {
	/** Undefined validator (always returns undefined). */
	readonly undefined: Validator<undefined>;
	/** Null validator (always returns null). */
	readonly null: Validator<null>;
	/** Create a boolean schema. */
	readonly boolean: typeof BooleanSchema.create & {
		readonly required: BooleanSchema<true>;
		readonly optional: BooleanSchema<boolean>;
	};
	/** Create a number schema. */
	readonly number: typeof NumberSchema.create & {
		readonly required: NumberSchema<number>;
		readonly optional: NumberSchema<number | null>;
	};
	/** An number representing a valid Unix timestamp in milliseconds, e.g. as returned by `Date.now()` */
	readonly timestamp: NumberSchema<number>;
	/** Create a string schema. */
	readonly string: typeof StringSchema.create & {
		readonly required: StringSchema<string>;
		readonly optional: StringSchema<string>;
	};
	/** Create a database key schema. */
	readonly key: typeof KeySchema.create & {
		readonly required: KeySchema;
		readonly optional: KeySchema;
	};
	/** Create a phone number schema (e.g. `+441234567890`). */
	readonly phone: typeof PhoneSchema.create & {
		readonly required: PhoneSchema;
		readonly optional: PhoneSchema;
	};
	/** Create a color schema (e.g. `#00CCFF`). */
	readonly color: typeof ColorSchema.create & {
		readonly required: ColorSchema;
		readonly optional: ColorSchema;
	};
	/** Create a URL schema. */
	readonly url: typeof UrlSchema.create & {
		readonly required: UrlSchema;
		readonly optional: UrlSchema;
	};
	/** Create an email schema. */
	readonly email: typeof EmailSchema.create & {
		readonly required: EmailSchema;
		readonly optional: EmailSchema;
	};
	/** Create a date schema. */
	readonly date: typeof DateSchema.create & {
		readonly required: DateSchema<string>;
		readonly optional: DateSchema<string | null>;
	};
	/** Create an array schema. */
	readonly array: typeof ArraySchema.create & {
		required<T>(items: Schema<T>): ArraySchema<T>;
		optional<T>(items: Schema<T>): ArraySchema<T>;
	};
	/** Create a map schema. */
	readonly map: typeof MapSchema.create & {
		required<T>(items: Validator<T>): MapSchema<T>;
		optional<T>(items: Validator<T>): MapSchema<T>;
	};
	/** Create an object schema. */
	readonly object: typeof ObjectSchema.create & {
		required<T extends ImmutableObject>(props: Validators<T>): ObjectSchema<T>;
		optional<T extends ImmutableObject | null>(props: Validators<T & ImmutableObject>): ObjectSchema<T | null>;
	};
	/** Create a Data schema (an object schema that only allows `Data` or a subset of it). */
	readonly data: <T extends Data>(props: Validators<T>, validator?: (value: T) => T) => ObjectSchema<T>;
} = {
	undefined: { validate: () => undefined },
	null: { validate: () => null },
	boolean: Object.assign(BooleanSchema.create, {
		required: BooleanSchema.create({ required: true }),
		optional: BooleanSchema.create({ required: false }),
	}),
	number: Object.assign(NumberSchema.create, {
		required: NumberSchema.create({ required: true, value: 0 }),
		optional: NumberSchema.create({ required: false }),
	}),
	timestamp: NumberSchema.create({ required: true, min: -62167219125000, max: 253370764800000 }), // Limited to four-digit years: 0000–9999
	string: Object.assign(StringSchema.create, {
		required: StringSchema.create({ required: true }),
		optional: StringSchema.create({ required: false }),
	}),
	key: Object.assign(KeySchema.create, {
		required: KeySchema.create({ required: true }),
		optional: KeySchema.create({ required: false }),
	}),
	color: Object.assign(ColorSchema.create, {
		required: ColorSchema.create({ required: true }),
		optional: ColorSchema.create({ required: false }),
	}),
	phone: Object.assign(PhoneSchema.create, {
		required: PhoneSchema.create({ required: true }),
		optional: PhoneSchema.create({ required: false }),
	}),
	url: Object.assign(UrlSchema.create, {
		required: UrlSchema.create({ required: true }),
		optional: UrlSchema.create({ required: false }),
	}),
	email: Object.assign(EmailSchema.create, {
		required: EmailSchema.create({ required: true }),
		optional: EmailSchema.create({ required: false }),
	}),
	date: Object.assign(DateSchema.create, {
		required: DateSchema.create<string>({ required: true, value: "now" }),
		optional: DateSchema.create<string | null>({ required: false }),
	}),
	array: Object.assign(ArraySchema.create, {
		required: <T>(items: Schema<T>): ArraySchema<T> => ArraySchema.create<T>({ items, required: true }),
		optional: <T>(items: Schema<T>): ArraySchema<T> => ArraySchema.create<T>({ items, required: false }),
	}),
	map: Object.assign(MapSchema.create, {
		required: <T>(items: Validator<T>): MapSchema<T> => MapSchema.create<T>({ items, required: true }),
		optional: <T>(items: Validator<T>): MapSchema<T> => MapSchema.create<T>({ items, required: false }),
	}),
	object: Object.assign(ObjectSchema.create, {
		required: <T extends ImmutableObject>(props: Validators<T>) => ObjectSchema.create<T>({ props, required: true, value: {} }),
		optional: <T extends ImmutableObject | null>(props: Validators<T & ImmutableObject>) => ObjectSchema.create<T>({ props, required: false }),
	}),
	data: <T extends Data>(props: Validators<T>, validator?: (value: T) => T): ObjectSchema<T> => ObjectSchema.create({ props, validator, required: true }),
};
