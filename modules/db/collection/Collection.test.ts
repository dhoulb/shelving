import { describe, expect, test } from "bun:test";
import {
	COLLECTION,
	Collection,
	CollectionItemSchema,
	CollectionItemsSchema,
	CollectionQueryItemsSchema,
	CollectionQuerySchema,
} from "shelving/db";
import { NULLABLE, OPTIONAL, STRING, UpdatesSchema } from "shelving/schema";
import type { Item, Items } from "shelving/util/item";
import type { Query, QueryItems } from "shelving/util/query";
import { getSource } from "shelving/util/source";
import type { Updates } from "shelving/util/update";

const USERS = COLLECTION("users", STRING, { name: STRING });
type UserItem = Item<string, { name: string }>;

describe("Collection", () => {
	test("TypeScript", () => {
		const i1: CollectionItemSchema<string, { name: string }> = USERS.item;
		const i2: UserItem = USERS.item.validate({ id: "a", name: "Dave" });
		const s1: CollectionItemsSchema<string, { name: string }> = USERS.items;
		const s2: Items<string, { name: string }> = USERS.items.validate([]);
		const q1: CollectionQuerySchema<string, { name: string }> = USERS.query;
		const q2: Query<UserItem> = USERS.query.validate({ name: "Dave" });
		const u1: UpdatesSchema<{ name: string }> = USERS.updates;
		const u2: Updates<{ name: string }> = USERS.updates.validate({ name: "Dave" });
		const r1: CollectionQueryItemsSchema<string, { name: string }> = USERS.queryItems;
		const r2: QueryItems<string, { name: string }> = USERS.queryItems.validate({ query: {}, items: [] });
	});
	test(".item validates a complete item", () => {
		expect(USERS.item).toBeInstanceOf(CollectionItemSchema);
		expect(USERS.item.validate({ id: "a", name: "Dave", excess: 1 })).toEqual({ id: "a", name: "Dave" });
		expect(() => USERS.item.validate("Dave")).toThrow();
	});
	test(".items validates a list of complete items", () => {
		expect(USERS.items).toBeInstanceOf(CollectionItemsSchema);
		expect(USERS.items.validate([{ id: "a", name: "Dave" }])).toEqual([{ id: "a", name: "Dave" }]);
		expect(() => USERS.items.validate(["Dave"])).toThrow();
	});
	test(".query validates a query on the items", () => {
		expect(USERS.query).toBeInstanceOf(CollectionQuerySchema);
		expect(USERS.query.validate({ name: "Dave", $limit: 5 })).toEqual({ name: "Dave", $limit: 5 });
		expect(USERS.query.validate({ id: ["a", "b"], $order: "!id" })).toEqual({ id: ["a", "b"], $order: "!id" });
		expect(() => USERS.query.validate({ anything: true })).toThrow("anything: Unknown prop");
		expect(() => USERS.query.validate("name")).toThrow("Must be object");
	});
	test(".updates validates updates to the item data", () => {
		expect(USERS.updates).toBeInstanceOf(UpdatesSchema);
		expect(USERS.updates.validate({ name: "Dave" })).toEqual({ name: "Dave" });
		expect(() => USERS.updates.validate({ id: "b" })).toThrow("id: Unknown prop");
	});
	test(".queryItems validates a query and its items", () => {
		expect(USERS.queryItems).toBeInstanceOf(CollectionQueryItemsSchema);
		const value = { query: { name: "Dave" }, items: [{ id: "a", name: "Dave" }] };
		expect(USERS.queryItems.validate(value)).toEqual(value);
		expect(() => USERS.queryItems.validate({ query: {}, items: ["Dave"] })).toThrow();
		expect(() => USERS.queryItems.validate({ query: "Dave", items: [] })).toThrow();
	});
	test("getSource() finds the collection from each schema", () => {
		expect(getSource(Collection, USERS.item)).toBe(USERS);
		expect(getSource(Collection, USERS.items)).toBe(USERS);
		expect(getSource(Collection, USERS.query)).toBe(USERS);
		expect(getSource(Collection, USERS.queryItems)).toBe(USERS);
	});
	test("getSource() finds the item schema through wrapper schemas", () => {
		expect(getSource(CollectionItemSchema, NULLABLE(USERS.item))).toBe(USERS.item);
		expect(getSource(CollectionItemsSchema, OPTIONAL(USERS.items))).toBe(USERS.items);
		expect(getSource(CollectionItemSchema, USERS.items)).toBe(undefined);
	});
});
