import { describe, expect, test } from "bun:test";
import { DATA, GET, JSONAPIProvider, POST, ResponseError, STRING } from "../../index.js";

describe("JSONAPIProvider", () => {
	test("getRequest() serializes POST payloads as JSON bodies", async () => {
		const provider = new JSONAPIProvider({ url: "https://api.example.com/" });
		const endpoint = POST("/items", DATA({ name: STRING }), STRING);
		const request = provider.getRequest(endpoint, { name: "abc" });

		expect(request.headers.get("Content-Type")).toBe("application/json");
		expect(await request.text()).toBe('{"name":"abc"}');
	});

	test("fetch() parses JSON responses even without a JSON content type", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response('{"value":"ok"}', { status: 200, headers: { "Content-Type": "text/plain" } });

			const provider = new JSONAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), DATA({ value: STRING }));

			expect(await provider.call(endpoint, { id: "1" })).toEqual({ value: "ok" });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError for non-ok responses using a JSON message", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response('{"message":"Teapot"}', { status: 418, headers: { "Content-Type": "text/plain" } });

			const provider = new JSONAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.call(endpoint, { id: "1" })).rejects.toMatchObject({ message: "Teapot", code: 418 });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError for invalid JSON", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response("not json", { status: 200, headers: { "Content-Type": "text/plain" } });

			const provider = new JSONAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.call(endpoint, { id: "1" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
