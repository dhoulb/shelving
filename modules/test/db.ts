import type { ValidatorType } from "../util/index.js";
import { ArraySchema, DateSchema, NumberSchema, ObjectSchema, StringSchema } from "../schema/index.js";
import { Provider, Database } from "../db/index.js";

// Schemas.
export const basicSchema = ObjectSchema.from({
	str: StringSchema.REQUIRED,
	num: NumberSchema.REQUIRED,
	group: StringSchema.create({ options: ["a", "b", "c"] as const }),
	tags: ArraySchema.from(StringSchema.REQUIRED),
});
export const personSchema = ObjectSchema.from({
	name: ObjectSchema.from({ first: StringSchema.REQUIRED, last: StringSchema.REQUIRED }),
	birthday: DateSchema.OPTIONAL,
});
export const collections = {
	basics: basicSchema,
	people: personSchema,
};

// Basic values.
export const allBasics = {
	basic3: { str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] } as ValidatorType<typeof basicSchema>,
	basic5: { str: "eee", num: 500, group: "b", tags: ["odd", "prime"] } as ValidatorType<typeof basicSchema>,
	basic7: { str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] } as ValidatorType<typeof basicSchema>,
	basic4: { str: "ddd", num: 400, group: "b", tags: ["even"] } as ValidatorType<typeof basicSchema>,
	basic1: { str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] } as ValidatorType<typeof basicSchema>,
	basic2: { str: "bbb", num: 200, group: "a", tags: ["even", "prime"] } as ValidatorType<typeof basicSchema>,
	basic8: { str: "hhh", num: 800, group: "c", tags: ["even"] } as ValidatorType<typeof basicSchema>,
	basic6: { str: "fff", num: 600, group: "b", tags: ["even"] } as ValidatorType<typeof basicSchema>,
	basic9: { str: "iii", num: 900, group: "c", tags: ["odd"] } as ValidatorType<typeof basicSchema>,
};

// People values.
export const allPeople = {
	person1: { name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" } as ValidatorType<typeof personSchema>,
	person2: { name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" } as ValidatorType<typeof personSchema>,
	person3: { name: { first: "Sammy", last: "Canister" }, birthday: null } as ValidatorType<typeof personSchema>,
	person4: { name: { first: "Jilly", last: "Jones" }, birthday: null } as ValidatorType<typeof personSchema>,
	person5: { name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" } as ValidatorType<typeof personSchema>,
};

// Make a new database around the above collections and a provider.
export const createTestDatabase = <P extends Provider>(
	provider: P,
): Database<{
	basics: ValidatorType<typeof basicSchema>;
	people: ValidatorType<typeof personSchema>;
}> => new Database(collections, provider);
