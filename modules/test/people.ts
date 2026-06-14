import { DATA } from "../schema/DataSchema.js";
import { NULLABLE_DATE } from "../schema/DateSchema.js";
import { REQUIRED_STRING } from "../schema/StringSchema.js";
import type { Item } from "../util/item.js";
import type { ValidatorType } from "../util/validate.js";

/**
 * Schema for a test "person" fixture, with a nested `name` and a nullable `birthday`.
 *
 * @see https://dhoulb.github.io/shelving/test/people/PERSON_SCHEMA
 */
export const PERSON_SCHEMA = DATA({
	name: DATA({ first: REQUIRED_STRING, last: REQUIRED_STRING }),
	birthday: NULLABLE_DATE,
});

/**
 * Validated data shape of a test person, inferred from `PERSON_SCHEMA`.
 *
 * @see https://dhoulb.github.io/shelving/test/people/PersonData
 */
export type PersonData = ValidatorType<typeof PERSON_SCHEMA>;

/**
 * A test person as a stored `Item` — `PersonData` plus a string `id`.
 *
 * @see https://dhoulb.github.io/shelving/test/people/PersonItem
 */
export type PersonItem = Item<string, PersonData>;

/**
 * Test person fixture: Dave Brook, born 1985-12-06.
 *
 * @see https://dhoulb.github.io/shelving/test/people/person1
 */
export const person1: PersonItem = { id: "person1", name: { first: "Dave", last: "Brook" }, birthday: "1985-12-06" };

/**
 * Test person fixture: Sally Callister, born 1973-11-19.
 *
 * @see https://dhoulb.github.io/shelving/test/people/person2
 */
export const person2: PersonItem = { id: "person2", name: { first: "Sally", last: "Callister" }, birthday: "1973-11-19" };

/**
 * Test person fixture: Sammy Canister, with no birthday (`null`).
 *
 * @see https://dhoulb.github.io/shelving/test/people/person3
 */
export const person3: PersonItem = { id: "person3", name: { first: "Sammy", last: "Canister" }, birthday: null };

/**
 * Test person fixture: Jilly Jones, with no birthday (`null`).
 *
 * @see https://dhoulb.github.io/shelving/test/people/person4
 */
export const person4: PersonItem = { id: "person4", name: { first: "Jilly", last: "Jones" }, birthday: null };

/**
 * Test person fixture: Terry Times, born 1964-08-01.
 *
 * @see https://dhoulb.github.io/shelving/test/people/person5
 */
export const person5: PersonItem = { id: "person5", name: { first: "Terry", last: "Times" }, birthday: "1964-08-01" };

/**
 * Ordered array of all five test person fixtures (`person1` through `person5`).
 *
 * @see https://dhoulb.github.io/shelving/test/people/people
 */
export const people: ReadonlyArray<PersonItem> = [person1, person2, person3, person4, person5];
