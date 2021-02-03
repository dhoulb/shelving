import { object, array, string, number, date, data } from "../schema";
import { Provider, Database, createDatabase } from "../db";
import { mapObject, EmptyObject } from "../object";

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
	basic3: { str: "ccc", num: 300, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.data,
	basic5: { str: "eee", num: 500, group: "b", tags: ["odd", "prime"] } as typeof basicSchema.data,
	basic7: { str: "ggg", num: 700, group: "c", tags: ["odd", "prime"] } as typeof basicSchema.data,
	basic4: { str: "ddd", num: 400, group: "b", tags: ["even"] } as typeof basicSchema.data,
	basic1: { str: "aaa", num: 100, group: "a", tags: ["odd", "prime"] } as typeof basicSchema.data,
	basic2: { str: "bbb", num: 200, group: "a", tags: ["even", "prime"] } as typeof basicSchema.data,
	basic8: { str: "hhh", num: 800, group: "c", tags: ["even"] } as typeof basicSchema.data,
	basic6: { str: "fff", num: 600, group: "b", tags: ["even"] } as typeof basicSchema.data,
	basic9: { str: "iii", num: 900, group: "c", tags: ["odd"] } as typeof basicSchema.data,
};
export const deleteBasics = mapObject(allBasics, undefined);

// People values.
export const allPeople = {
	person1: { name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" } as typeof personSchema.data,
	person2: { name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" } as typeof personSchema.data,
	person3: { name: { first: "Sammy", last: "Canister" }, birthday: null } as typeof personSchema.data,
	person4: { name: { first: "Jilly", last: "Jones" }, birthday: null } as typeof personSchema.data,
	person5: { name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" } as typeof personSchema.data,
};
export const deletePeople = mapObject(allPeople, undefined);

// Make a new database around the above collections and a provider.
export const createTestDatabase = <P extends Provider>(provider: P): Database<EmptyObject, typeof collections> => createDatabase({ collections, provider });
