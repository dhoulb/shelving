import { describe, expect, test } from "bun:test";
import { DATA, DebugAPIProvider, GET, MockAPIProvider, ResponseError, STRING } from "../../index.js";

describe("DebugAPIProvider", () => {
	test("logs successful fetches through the source provider", async () => {
		const source = new MockAPIProvider(async () => Response.json("ok"));
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const logs: unknown[][] = [];
		const debug = console.debug;

		try {
			console.debug = (...args) => void logs.push(args);
			expect(await provider.fetch(endpoint, { id: "123" })).toBe("ok");
		} finally {
			console.debug = debug;
		}

		expect(logs).toEqual([
			["⋯ FETCH", "GET", "/users/{id}", { id: "123" }],
			["↩ FETCH", "GET", "/users/{id}", "ok"],
		]);
	});

	test("logs failed fetches and rethrows the source error", async () => {
		const source = new MockAPIProvider(async () => new Response("Nope", { status: 500, headers: { "Content-Type": "text/plain" } }));
		const provider = new DebugAPIProvider(source);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const logs: unknown[][] = [];
		const debug = console.debug;
		const error = console.error;

		try {
			console.debug = () => undefined;
			console.error = (...args) => void logs.push(args);
			await expect(provider.fetch(endpoint, { id: "123" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			console.debug = debug;
			console.error = error;
		}

		expect(logs).toHaveLength(1);
		expect(logs[0]?.slice(0, 4)).toEqual(["✘ FETCH", "GET", "/users/{id}", { id: "123" }]);
		expect(logs[0]?.[4]).toBeInstanceOf(ResponseError);
	});
});
