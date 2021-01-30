import type { Validator } from ".";

/** Validator that always returns null. */
export const alwaysNull: Validator<undefined> = {
	validate: () => undefined,
};
