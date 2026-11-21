import { describe, expect, test } from "bun:test";
import { CachedAPIProvider, EndpointCache, GET, MockAPIProvider, POST } from "shelving/api";
import { DATA, STRING } from "shelving/schema";
import { runMicrotasks } from "shelving/util/async";

describe("EndpointCache", () => {
	test("reuses the same store for deeply equal payloads", () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);

		const first = cache.get({ id: "123", extra: "x" });
		const second = cache.get({ id: "123", extra: "x" });

		expect(first).toBe(second);
	});

	test("reuses the same store for payloads in a different key order", () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = GET("/users", DATA({ a: STRING, b: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);
		expect(cache.get({ a: "1", b: "2" })).toBe(cache.get({ b: "2", a: "1" }));
		expect(cache.get({ a: "1", b: "2" })).not.toBe(cache.get({ a: "1", b: "3" }));
	});

	test("uses a different store for each body payload on the same path", () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = POST("/search", DATA({ q: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);
		expect(cache.get({ q: "a" })).not.toBe(cache.get({ q: "b" }));
	});

	test("refresh() re-fetches only the targeted payload", async () => {
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

		// Trigger initial fetches.
		first.loading;
		second.loading;
		await runMicrotasks();
		expect(first.value).toBe("123:1");
		expect(second.value).toBe("456:1");

		await cache.refresh({ id: "123" });

		expect(first.value).toBe("123:2");
		expect(second.value).toBe("456:1"); // untouched
	});

	test("invalidateAll() marks every cached store stale", async () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const cache = new EndpointCache(endpoint, provider);
		const first = cache.get({ id: "123" });
		const second = cache.get({ id: "456" });

		// Populate both stores.
		await first.refresh();
		await second.refresh();
		expect(first.value).toBe("ok");
		expect(second.value).toBe("ok");

		cache.invalidateAll();

		// Values are preserved (loading stays false), but stores are marked stale.
		expect(first.loading).toBe(false);
		expect(second.loading).toBe(false);
		expect(first.value).toBe("ok");
		expect(second.value).toBe("ok");

		// Reading loading (which already happened above) triggers background re-fetches
		// because _invalid=true. Await to let them complete.
		await runMicrotasks();
		expect(first.value).toBe("ok"); // same value returned by provider
		expect(second.value).toBe("ok");
	});
});

describe("CachedAPIProvider", () => {
	test("caches GET calls", async () => {
		let calls = 0;
		const provider = new CachedAPIProvider(new MockAPIProvider(async () => Response.json(`${++calls}`)));
		const endpoint = GET("/users", DATA({ a: STRING, b: STRING }), STRING);
		expect(await provider.call(endpoint, { a: "1", b: "2" })).toBe("1");
		expect(await provider.call(endpoint, { b: "2", a: "1" })).toBe("1");
		expect(calls).toBe(1);
	});

	test("sends POST calls to the source every time", async () => {
		let calls = 0;
		const provider = new CachedAPIProvider(new MockAPIProvider(async () => Response.json(`${++calls}`)));
		const endpoint = POST("/users", DATA({ name: STRING }), STRING);
		expect(await provider.call(endpoint, { name: "Dave" })).toBe("1");
		expect(await provider.call(endpoint, { name: "Dave" })).toBe("2");
		expect(calls).toBe(2);
	});
});
