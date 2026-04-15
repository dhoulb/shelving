import { describe, expect, test } from "bun:test";
import { ClientAPIProvider, DATA, GET, POST, RequiredError, ResponseError, STRING, ValidationAPIProvider } from "../../index.js";

describe("ClientAPIProvider", () => {
	test("getRequest() renders placeholders into the URL and omits them from the remaining payload", () => {
		const provider = new ClientAPIProvider({ url: "https://api.example.com/v1/" });
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);
		const request = provider.getRequest(endpoint, { id: "123", extra: "x" });

		expect(request.method).toBe("GET");
		expect(request.url).toBe("https://api.example.com/v1/users/123?extra=x");
	});

	test("getRequest() serializes POST payloads as JSON bodies", async () => {
		const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
		const endpoint = POST("/items", DATA({ name: STRING }), STRING);
		const request = provider.getRequest(endpoint, { name: "abc" });

		expect(request.headers.get("Content-Type")).toBe("application/json");
		expect(await request.text()).toBe(JSON.stringify({ name: "abc" }));
	});

	test("getRequest() rejects non-data payloads for GET endpoints", () => {
		const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		expect(() => provider.getRequest(endpoint, "123" as never)).toThrow(RequiredError);
	});

	test("fetch() returns validated JSON responses", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => Response.json("Hello from fetch");

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			expect(await provider.call(endpoint, { id: "1" })).toBe("Hello from fetch");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() parses text responses", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response("plain text", { status: 200, headers: { "Content-Type": "text/plain" } });

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			expect(await provider.call(endpoint, { id: "1" })).toBe("plain text");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() merges provider default options with call options into the request", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async (request: Request) => {
				expect(request.headers.get("X-Default")).toBe("provider");
				expect(request.headers.get("X-Call")).toBe("call");
				expect(request.headers.get("Content-Type")).toBe("application/custom");
				return await Response.json("ok");
			};

			const provider = new ClientAPIProvider({
				url: "https://api.example.com/",
				options: { headers: { "X-Default": "provider", "Content-Type": "application/custom" } },
			});
			const endpoint = POST("/items", DATA({ name: STRING }), STRING);

			expect(await provider.call(endpoint, { name: "abc" }, { headers: { "X-Call": "call" } })).toBe("ok");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() forwards abort signals", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async (request: Request) => {
				expect(request.signal.aborted).toBe(false);
				return await Response.json("ok");
			};

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);
			const controller = new AbortController();

			await provider.call(endpoint, { id: "1" }, { signal: controller.signal });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError when the response payload is invalid (via ValidationAPIProvider)", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => Response.json(false);

			const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com/" }));
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.call(endpoint, { id: "1" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError for non-ok responses using the parsed response message", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response("Teapot", { status: 418, headers: { "Content-Type": "text/plain" } });

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.call(endpoint, { id: "1" })).rejects.toMatchObject({ message: "Teapot", code: 418 });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
