import { describe, expect, test } from "bun:test";
import { APICache, DATA, GET, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";

describe("APICache", () => {
	test("creates endpoint stores that fetch through the configured provider", async () => {
		const provider = new MockAPIProvider({
			url: "https://api.example.com/v1/",
			handler: async request =>
				new Response(JSON.stringify(`ok:${new URL(request.url).pathname}`), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		});
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);

		const store = cache.get(endpoint).get({ id: "123", extra: "x" });
		await store.fetch();

		expect(store.value).toBe("ok:/v1/users/123");
		expect(provider.calls).toHaveLength(1);
		expect(provider.calls[0]?.request.url).toBe("https://api.example.com/v1/users/123?extra=x");
	});

	test("reuses the same store for the same endpoint and payload", () => {
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: async () =>
				new Response(JSON.stringify("ok"), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		});
		const cache = new APICache(provider);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);

		const a = cache.get(endpoint).get({ id: "123" });
		const b = cache.get(endpoint).get({ id: "123" });

		expect(a).toBe(b);
	});

	test("invalidate() resets a cached store so the next read refetches", async () => {
		let count = 0;
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: async () =>
				new Response(JSON.stringify(`ok:${++count}`), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		});
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
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: async request => {
				const id = request.url.split("/").pop() ?? "";
				const count = (calls.get(id) ?? 0) + 1;
				calls.set(id, count);
				return new Response(JSON.stringify(`${id}:${count}`), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
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
