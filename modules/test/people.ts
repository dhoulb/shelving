import { DATA } from "../schema/DataSchema.js";
import { OPTIONAL_DATE } from "../schema/DateSchema.js";
import { REQUIRED_STRING } from "../schema/StringSchema.js";
import type { ValidatorType } from "../util/validate.js";

export const PERSON_SCHEMA = DATA({
	name: DATA({ first: REQUIRED_STRING, last: REQUIRED_STRING }),
	birthday: OPTIONAL_DATE,
});
type PersonData = ValidatorType<typeof PERSON_SCHEMA>;

export const person1: PersonData = { name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" };
export const person2: PersonData = { name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" };
export const person3: PersonData = { name: { first: "Sammy", last: "Canister" }, birthday: null };
export const person4: PersonData = { name: { first: "Jilly", last: "Jones" }, birthday: null };
export const person5: PersonData = { name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" };

export const peopleResults = new Map<string, PersonData>([
	["person1", person1],
	["person2", person2],
	["person3", person3],
	["person4", person4],
	["person5", person5],
]);
