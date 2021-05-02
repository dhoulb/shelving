import { ArraySchema, DateSchema, NumberSchema, ObjectSchema, StringSchema } from "../schema";
import { Provider, Database } from "../db";

// Schemas.
export const basicSchema = ObjectSchema.with({
	str: StringSchema.REQUIRED,
	num: NumberSchema.REQUIRED,
	group: StringSchema.create({ options: ["a", "b", "c"] as const }),
	tags: ArraySchema.with(StringSchema.REQUIRED),
});
export const personSchema = ObjectSchema.with({
	name: ObjectSchema.with({ first: StringSchema.REQUIRED, last: StringSchema.REQUIRED }),
	birthday: DateSchema.OPTIONAL,
});
export const collections = {
	basics: basicSchema,
	people: personSchema,
};

// Basic values.
export const allBasics = {
	basic3: { str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.TYPE,
	basic5: { str: "eee", num: 500, group: "b", tags: ["odd", "prime"] } as typeof basicSchema.TYPE,
	basic7: { str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] } as typeof basicSchema.TYPE,
	basic4: { str: "ddd", num: 400, group: "b", tags: ["even"] } as typeof basicSchema.TYPE,
	basic1: { str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.TYPE,
	basic2: { str: "bbb", num: 200, group: "a", tags: ["even", "prime"] } as typeof basicSchema.TYPE,
	basic8: { str: "hhh", num: 800, group: "c", tags: ["even"] } as typeof basicSchema.TYPE,
	basic6: { str: "fff", num: 600, group: "b", tags: ["even"] } as typeof basicSchema.TYPE,
	basic9: { str: "iii", num: 900, group: "c", tags: ["odd"] } as typeof basicSchema.TYPE,
};

// People values.
export const allPeople = {
	person1: { name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" } as typeof personSchema.TYPE,
	person2: { name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" } as typeof personSchema.TYPE,
	person3: { name: { first: "Sammy", last: "Canister" }, birthday: null } as typeof personSchema.TYPE,
	person4: { name: { first: "Jilly", last: "Jones" }, birthday: null } as typeof personSchema.TYPE,
	person5: { name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" } as typeof personSchema.TYPE,
};

// Make a new database around the above collections and a provider.
export const createTestDatabase = <P extends Provider>(
	provider: P,
): Database<{
	basics: typeof basicSchema.TYPE;
	people: typeof personSchema.TYPE;
}> => Database.create(collections, provider);
