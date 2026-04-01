import { describe, expect, test } from "bun:test";
import { ClientAPIProvider, DATA, GET, POST, ResponseError, STRING, ValidationAPIProvider } from "../../index.js";

describe("ClientAPIProvider", () => {
	test("fetch() returns validated JSON responses", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () =>
				new Response(JSON.stringify("Hello from fetch"), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			expect(await provider.fetch(endpoint, { id: "1" })).toBe("Hello from fetch");
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
				return await new Response(JSON.stringify("ok"), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			};

			const provider = new ClientAPIProvider({
				url: "https://api.example.com/",
				options: { headers: { "X-Default": "provider", "Content-Type": "application/custom" } },
			});
			const endpoint = POST("/items", DATA({ name: STRING }), STRING);

			expect(await provider.fetch(endpoint, { name: "abc" }, { headers: { "X-Call": "call" } })).toBe("ok");
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
				return await new Response(JSON.stringify("ok"), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			};

			const provider = new ClientAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);
			const controller = new AbortController();

			await provider.fetch(endpoint, { id: "1" }, { signal: controller.signal });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError when the response payload is invalid (via ValidationAPIProvider)", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () =>
				new Response(JSON.stringify(false), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});

			const provider = new ValidationAPIProvider(new ClientAPIProvider({ url: "https://api.example.com/" }));
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.fetch(endpoint, { id: "1" })).rejects.toBeInstanceOf(ResponseError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
