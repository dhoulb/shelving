import { BASIC_SCHEMA } from "./basics.js";
import { PERSON_SCHEMA } from "./people.js";

export * from "./basics.js";
export * from "./people.js";
export * from "./util.js";

export const TEST_SCHEMAS = {
	basics: BASIC_SCHEMA,
	people: PERSON_SCHEMA,
};
