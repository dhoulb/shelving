import { describe, expect, test } from "bun:test";
import { GET, HydratingAPIProvider, MockEndpointAPIProvider } from "shelving/api";
import { COLLECTION, MemoryDBProvider } from "shelving/db";
import { ARRAY, DATA, NULLABLE, STRING } from "shelving/schema";

const USERS = COLLECTION("users", STRING, { name: STRING });
const SQUADS = COLLECTION("squads", STRING, { title: STRING });
const dave = { id: "dave", name: "Dave" };
const ada = { id: "ada", name: "Ada" };
const reds = { id: "reds", title: "Reds" };

const GET_USER = GET("/user/{id}", DATA({ id: STRING }), NULLABLE(USERS.item));
const LIST_USERS = GET("/user", DATA({}), USERS.items);
const LIST_USERS_ARRAY = GET("/array", DATA({}), ARRAY(USERS.item));
const MY_SQUADS = GET("/squad/me", DATA({}), DATA({ squads: SQUADS.queryItems, users: USERS.items }));
const FIND_USERS = GET("/find/user", DATA({ name: STRING }), USERS.queryItems);
const FIND_FIRST_USER = GET("/first/user", DATA({ name: STRING }), USERS.queryItems);

function _setup() {
	const db = new MemoryDBProvider<string>();
	const server = new MemoryDBProvider<string>();
	const api = new HydratingAPIProvider(
		new MockEndpointAPIProvider(
			[
				GET_USER.handler(({ id }) => (id === "dave" ? dave : null)),
				LIST_USERS.handler(() => [dave, ada]),
				LIST_USERS_ARRAY.handler(() => [dave, ada]),
				MY_SQUADS.handler(() => ({ squads: { query: { title: "Reds" }, items: [reds] }, users: [dave] })),
				FIND_USERS.handler(({ name }) => ({ query: { name }, items: server.getTable(USERS).getQuery({ name }) })),
				FIND_FIRST_USER.handler(({ name }) => {
					const query = { name, $order: "id", $limit: 1 } as const;
					return { query, items: server.getTable(USERS).getQuery(query) };
				}),
			],
			undefined,
		),
		db,
	);
	return { db, api, server, users: db.getTable(USERS), squads: db.getTable(SQUADS) };
}

describe("HydratingAPIProvider", () => {
	test("an item result sets the item", async () => {
		const { api, users } = _setup();
		expect(await api.call(GET_USER, { id: "dave" })).toEqual(dave);
		expect(users.getItem("dave")).toEqual(dave);
	});
	test("a null item result deletes the item with the id from the payload", async () => {
		const { api, users } = _setup();
		users.setItem("ada", ada);
		expect(await api.call(GET_USER, { id: "ada" })).toBe(null);
		expect(users.getItem("ada")).toBe(undefined);
		expect(users.getItemTime("ada")).toBeNumber(); // Known missing, so a store shows it as missing.
	});
	test("an items result sets every item", async () => {
		const { api, users } = _setup();
		await api.call(LIST_USERS, {});
		expect(users.getQuery({ $order: "id" })).toEqual([ada, dave]);
	});
	test("an ARRAY() of items does not hydrate", async () => {
		const { api, users } = _setup();
		expect(await api.call(LIST_USERS_ARRAY, {})).toEqual([dave, ada]);
		expect(users.getQuery()).toEqual([]);
	});
	test("a data result hydrates each prop, and marks the query of query items as loaded", async () => {
		const { api, users, squads } = _setup();
		await api.call(MY_SQUADS, {});
		expect(squads.getItem("reds")).toEqual(reds);
		expect(squads.getQueryTime({ title: "Reds" })).toBeNumber();
		expect(users.getItem("dave")).toEqual(dave);
	});
	test("query items invalidate items in memory that match the query but are not in the result", async () => {
		const { api, server, users } = _setup();
		await server.setItem(USERS, "dave", { name: "Dave" });
		users.setItem("dave", dave);
		users.setItem("old", { id: "old", name: "Dave" }); // Matches in memory, but the server has changed or deleted it.
		users.setItem("ada", ada); // Does not match, so it stays.
		await api.call(FIND_USERS, { name: "Dave" });
		expect(users.getItem("dave")).toEqual(dave);
		expect(users.getItem("old")).toBe(undefined);
		expect(users.getItemTime("old")).toBe(undefined); // Not known to be missing, so it loads again.
		expect(users.getItem("ada")).toEqual(ada);
	});
	test("query items with a $limit invalidate nothing", async () => {
		const { api, server, users } = _setup();
		await server.setItem(USERS, "dave", { name: "Dave" });
		users.setItem("old", { id: "old", name: "Dave" });
		await api.call(FIND_FIRST_USER, { name: "Dave" });
		expect(users.getItem("old")).toEqual({ id: "old", name: "Dave" });
	});
	test("after random server writes, an unlimited query in memory matches the server after each call", async () => {
		const { api, server, db } = _setup();
		const names = ["Dave", "Ada"];
		const ids = ["a", "b", "c", "d"];
		let seed = 1;
		const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; // Seeded, so a failure can run again.
		for (let i = 0; i < 200; i++) {
			const id = ids[Math.floor(random() * ids.length)] ?? "a";
			if (random() < 0.3) await server.deleteItem(USERS, id);
			else await server.setItem(USERS, id, { name: names[Math.floor(random() * names.length)] ?? "Dave" });
			const name = names[Math.floor(random() * names.length)] ?? "Dave";
			await api.call(FIND_USERS, { name });
			expect(await db.getQuery(USERS, { name, $order: "id" })).toEqual(await server.getQuery(USERS, { name, $order: "id" }));
		}
	});
});
