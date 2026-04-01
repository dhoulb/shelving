import { describe, expect, test } from "bun:test";
import { DATA, EndpointCache, GET, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";

describe("EndpointCache", () => {
	test("reuses the same store for deeply equal payloads", () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);

		const first = cache.get({ id: "123", extra: "x" });
		const second = cache.get({ id: "123", extra: "x" });

		expect(first).toBe(second);
	});

	test("refetch() refreshes only the targeted payload", async () => {
		const calls = new Map<string, number>();
		const provider = new MockAPIProvider(async request => {
			const id = request.url.split("/").pop() ?? "";
			const count = (calls.get(id) ?? 0) + 1;
			calls.set(id, count);
			return Response.json(`${id}:${count}`);
		});
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);
		const first = cache.get({ id: "123" });
		const second = cache.get({ id: "456" });

		await runMicrotasks();
		expect(first.value).toBe("123:1");
		expect(second.value).toBe("456:1");

		cache.refetch({ id: "123" });
		await runMicrotasks();

		expect(first.value).toBe("123:2");
		expect(second.value).toBe("456:1");
	});

	test("invalidateAll() resets every cached store", async () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);
		const first = cache.get({ id: "123" });
		const second = cache.get({ id: "456" });

		await first.fetch();
		await second.fetch();
		cache.invalidateAll();

		expect(first.loading).toBe(true);
		expect(second.loading).toBe(true);
	});
});
