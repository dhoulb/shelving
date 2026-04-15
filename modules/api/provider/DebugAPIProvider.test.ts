import { describe, expect, test } from "bun:test";
import { DATA, DebugAPIProvider, GET, MockAPIProvider, ResponseError, STRING } from "../../index.js";

describe("DebugAPIProvider", () => {
	test("logs successful fetches through the source provider", async () => {
		const source = new MockAPIProvider(async () => Response.json("BODY", { status: 200, statusText: "OK" }));
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const logs: unknown[][] = [];
		const debug = console.debug;

		try {
			console.debug = (...args) => void logs.push(args);
			expect(await provider.call(endpoint, { id: "123" })).toBe("BODY");
		} finally {
			console.debug = debug;
		}

		expect(logs).toEqual([
			[
				"… FETCH", //
				"https://api.mock.com/",
				"GET /users/{id}",
				{ id: "123" },
				"GET https://api.mock.com/users/123",
			],
			[
				"✔ FETCH",
				"https://api.mock.com/",
				"GET /users/{id}",
				{ id: "123" },
				"GET https://api.mock.com/users/123",
				'200 OK\ncontent-type: application/json;charset=utf-8\n\n"BODY"',
				"BODY",
			],
		]);
	});

	test("logs failed fetches and rethrows the source error", async () => {
		const source = new MockAPIProvider(
			async () => new Response("NOPE", { status: 500, statusText: "Internal Server Error", headers: { "Content-Type": "text/plain" } }),
		);
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const logs: unknown[][] = [];
		const debug = console.debug;
		const error = console.error;

		try {
			console.debug = () => undefined;
			console.error = (...args) => void logs.push(args);
			await expect(provider.call(endpoint, { id: "123" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			console.debug = debug;
			console.error = error;
		}

		expect(logs).toHaveLength(1);
		expect(logs[0]?.slice(0, 5)).toEqual([
			"✘ FETCH",
			"https://api.mock.com/",
			"GET /users/{id}",
			{ id: "123" },
			"GET https://api.mock.com/users/123",
		]);
		expect(logs[0]?.[5]).toBe("500 Internal Server Error\ncontent-type: text/plain\n\nNOPE");
		expect(logs[0]?.[6]).toBeInstanceOf(ResponseError);
	});
});
