import type { Validator } from "./Validator";

/** Validator that always returns null. */
export const NULL_VALIDATOR: Validator<undefined> = {
	validate: () => undefined,
};
