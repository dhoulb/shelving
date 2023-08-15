import type { Item } from "../util/item.js";
import type { ValidatorType } from "../util/validate.js";
import { DATA } from "../schema/DataSchema.js";
import { OPTIONAL_DATE } from "../schema/DateSchema.js";
import { REQUIRED_STRING } from "../schema/StringSchema.js";

export const PERSON_SCHEMA = DATA({
	name: DATA({ first: REQUIRED_STRING, last: REQUIRED_STRING }),
	birthday: OPTIONAL_DATE,
});
export type PersonData = ValidatorType<typeof PERSON_SCHEMA>;
export type PersonItemData = Item<PersonData>;

export const person1: PersonItemData = { id: "person1", name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" };
export const person2: PersonItemData = { id: "person2", name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" };
export const person3: PersonItemData = { id: "person3", name: { first: "Sammy", last: "Canister" }, birthday: null };
export const person4: PersonItemData = { id: "person4", name: { first: "Jilly", last: "Jones" }, birthday: null };
export const person5: PersonItemData = { id: "person5", name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" };

export const people: ReadonlyArray<PersonItemData> = [person1, person2, person3, person4, person5];
