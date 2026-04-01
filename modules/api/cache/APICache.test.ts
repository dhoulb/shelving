import { describe, expect, test } from "bun:test";
import { APICache, DATA, GET, MockAPIProvider, STRING } from "../../index.js";

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
});
