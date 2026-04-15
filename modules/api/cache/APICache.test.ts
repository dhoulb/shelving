import { describe, expect, test } from "bun:test";
import { APICache, DATA, GET, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";
import { ClientAPIProvider } from "../provider/ClientAPIProvider.js";

describe("APICache", () => {
	test("creates endpoint stores that fetch through the configured provider", async () => {
		const provider = new MockAPIProvider(
			async request => Response.json(`ok:${new URL(request.url).pathname}`),
			new ClientAPIProvider({ url: "https://api.example.com/v1/" }),
		);
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);

		const store = cache.get(endpoint).get({ id: "123", extra: "x" });
		await store.fetch();

		expect(store.value).toBe("ok:/v1/users/123");
		expect(provider.fetchCalls).toHaveLength(1);
		expect(provider.fetchCalls[0]?.request.url).toBe("https://api.example.com/v1/users/123?extra=x");
	});

	test("reuses the same store for the same endpoint and payload", () => {
		const provider = new MockAPIProvider(async () => Response.json("ok"));
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);

		const a = cache.get(endpoint).get({ id: "123" });
		const b = cache.get(endpoint).get({ id: "123" });

		expect(a).toBe(b);
	});

	test("invalidate() resets a cached store so the next read refetches", async () => {
		let count = 0;
		const provider = new MockAPIProvider(async () => Response.json(`ok:${++count}`));
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = cache.get(endpoint).get({ id: "123" });

		await store.fetch();
		expect(store.value).toBe("ok:1");

		cache.invalidate(endpoint, { id: "123" });
		expect(store.loading).toBe(true);

		try {
			store.value;
			expect.unreachable();
		} catch {}

		await runMicrotasks();
		expect(store.value).toBe("ok:2");
	});

	test("refetchAll() refetches every cached payload for an endpoint", async () => {
		const calls = new Map<string, number>();
		const provider = new MockAPIProvider(async request => {
			const id = request.url.split("/").pop() ?? "";
			const count = (calls.get(id) ?? 0) + 1;
			calls.set(id, count);
			return Response.json(`${id}:${count}`);
		});
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const first = cache.get(endpoint).get({ id: "123" });
		const second = cache.get(endpoint).get({ id: "456" });

		await runMicrotasks();
		expect(first.value).toBe("123:1");
		expect(second.value).toBe("456:1");

		cache.refetchAll(endpoint);
		await runMicrotasks();

		expect(first.value).toBe("123:2");
		expect(second.value).toBe("456:2");
	});
});
