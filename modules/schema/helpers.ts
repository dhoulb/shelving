import type { Validator } from "./Validator";

/** Modify an input schema to make it allow undefined (in addition to its normally valid value). */
export const withUndefined = <T>(validator: Validator<T>): Validator<T | undefined> => ({
	validate: (unsafeValue: unknown): T | undefined => (unsafeValue === undefined ? unsafeValue : validator.validate(unsafeValue)),
});
