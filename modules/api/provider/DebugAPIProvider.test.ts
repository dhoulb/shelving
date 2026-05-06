import { describe, expect, test } from "bun:test";
import { DATA, DebugAPIProvider, GET, MockAPIProvider, ResponseError, STRING } from "../../index.js";

describe("DebugAPIProvider", () => {
	test("logs successful calls", async () => {
		const source = new MockAPIProvider(async () => Response.json("BODY", { status: 200, statusText: "OK" }));
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const debugLogs: unknown[][] = [];
		const errorLogs: unknown[][] = [];
		const debug = console.debug;
		const error = console.error;

		try {
			console.debug = (...args) => void debugLogs.push(args);
			console.error = (...args) => void errorLogs.push(args);
			expect(await provider.call(endpoint, { id: "123" })).toBe("BODY");
		} finally {
			console.debug = debug;
			console.error = error;
		}

		expect(debugLogs).toEqual([
			["✔ REQUEST", "https://api.mock.com/", "GET /users/{id}", { id: "123" }],
			["→ FETCH", "https://api.mock.com/", "GET https://api.mock.com/users/123"],
			["← FETCH", "https://api.mock.com/", '200 OK\ncontent-type: application/json;charset=utf-8\n\n"BODY"'],
			["✔ RESPONSE", "https://api.mock.com/", "GET /users/{id}", "BODY"],
		]);
		expect(errorLogs).toEqual([]);
	});

	test("logs failed responses and rethrows the error", async () => {
		const source = new MockAPIProvider(
			async () => new Response("NOPE", { status: 500, statusText: "Internal Server Error", headers: { "Content-Type": "text/plain" } }),
		);
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const debugLogs: unknown[][] = [];
		const errorLogs: unknown[][] = [];
		const debug = console.debug;
		const error = console.error;

		try {
			console.debug = (...args) => void debugLogs.push(args);
			console.error = (...args) => void errorLogs.push(args);
			await expect(provider.call(endpoint, { id: "123" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			console.debug = debug;
			console.error = error;
		}

		expect(debugLogs).toEqual([
			["✔ REQUEST", "https://api.mock.com/", "GET /users/{id}", { id: "123" }],
			["→ FETCH", "https://api.mock.com/", "GET https://api.mock.com/users/123"],
			["← FETCH", "https://api.mock.com/", "500 Internal Server Error\ncontent-type: text/plain\n\nNOPE"],
		]);
		expect(errorLogs).toHaveLength(1);
		expect(errorLogs[0]?.[0]).toBe("✘ RESPONSE");
		expect(errorLogs[0]?.[1]).toBe("https://api.mock.com/");
		expect(errorLogs[0]?.[2]).toBe("GET /users/{id}");
		expect(errorLogs[0]?.[3]).toBeInstanceOf(ResponseError);
	});
});
