import { object, array, string, number, date, data } from "../schema";
import { Provider, Database, createDatabase } from "../db";
import { EmptyObject } from "../object";

// Schemas.
export const basicSchema = data({
	props: {
		str: string.required,
		num: number.required,
		group: string({ options: ["a", "b", "c"] as const }),
		tags: array.optional(string.required),
	},
});
export const personSchema = data({
	props: {
		name: object.required({ first: string.required, last: string.required }),
		birthday: date.optional,
	},
});
export const collections = {
	basics: basicSchema,
	people: personSchema,
};

// Basic values.
export const allBasics = {
	basic3: { str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.type,
	basic5: { str: "eee", num: 500, group: "b", tags: ["odd", "prime"] } as typeof basicSchema.type,
	basic7: { str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] } as typeof basicSchema.type,
	basic4: { str: "ddd", num: 400, group: "b", tags: ["even"] } as typeof basicSchema.type,
	basic1: { str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.type,
	basic2: { str: "bbb", num: 200, group: "a", tags: ["even", "prime"] } as typeof basicSchema.type,
	basic8: { str: "hhh", num: 800, group: "c", tags: ["even"] } as typeof basicSchema.type,
	basic6: { str: "fff", num: 600, group: "b", tags: ["even"] } as typeof basicSchema.type,
	basic9: { str: "iii", num: 900, group: "c", tags: ["odd"] } as typeof basicSchema.type,
};

// People values.
export const allPeople = {
	person1: { name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" } as typeof personSchema.type,
	person2: { name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" } as typeof personSchema.type,
	person3: { name: { first: "Sammy", last: "Canister" }, birthday: null } as typeof personSchema.type,
	person4: { name: { first: "Jilly", last: "Jones" }, birthday: null } as typeof personSchema.type,
	person5: { name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" } as typeof personSchema.type,
};

// Make a new database around the above collections and a provider.
export const createTestDatabase = <P extends Provider>(provider: P): Database<EmptyObject, typeof collections> => createDatabase({ collections, provider });
