import { DeepPartial, ImmutableObject } from "../object";
import type { Validator } from "./Validator";

/** Validator that always returns undefined. */
export const UNDEFINED_VALIDATOR: Validator<undefined> = {
	validate: () => undefined,
};

/** Modify an input schema to make it allow undefined (in addition to its normally valid value). */
export const withUndefined = <T>(validator: Validator<T>): Validator<T | undefined> => ({
	validate: (unsafeValue: unknown): T | undefined => (unsafeValue === undefined ? unsafeValue : validator.validate(unsafeValue)),
});

/** Modify an input schema to make it allow undefined or a partial of the valid value. */
export const withPartial = <T>(validator: Validator<T>): Validator<T | DeepPartial<T & ImmutableObject> | undefined> =>
	withUndefined<T | DeepPartial<T & ImmutableObject>>(validator.partial || validator);
