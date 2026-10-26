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

function _setup() {
	const db = new MemoryDBProvider<string>();
	const api = new HydratingAPIProvider(
		new MockEndpointAPIProvider(
			[
				GET_USER.handler(({ id }) => (id === "dave" ? dave : null)),
				LIST_USERS.handler(() => [dave, ada]),
				LIST_USERS_ARRAY.handler(() => [dave, ada]),
				MY_SQUADS.handler(() => ({ squads: { query: { title: "Reds" }, items: [reds] }, users: [dave] })),
			],
			undefined,
		),
		db,
	);
	return { db, api, users: db.getTable(USERS), squads: db.getTable(SQUADS) };
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
});
