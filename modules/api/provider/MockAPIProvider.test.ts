import { describe, expect, test } from "bun:test";
import { DATA, GET, MockAPIProvider, POST, ResponseError, STRING, ValidationAPIProvider } from "../../index.js";

describe("MockAPIProvider", () => {
	test("fetch() returns parsed handler responses and logs the resolved result", async () => {
		const provider = new MockAPIProvider(
			request => {
				expect(request.url).toBe("https://api.example.com/v1/users/123?extra=x");
				return Response.json("mocked");
			},
			{ url: "https://api.example.com/v1/" },
		);
		const endpoint = GET("/users/{id}", DATA({ id: STRING, extra: STRING }), STRING);

		expect(await provider.fetch(endpoint, { id: "123", extra: "x" })).toBe("mocked");
		expect(provider.calls).toHaveLength(1);
		expect(provider.calls[0]).toMatchObject({
			type: "fetch",
			endpoint,
			payload: { id: "123", extra: "x" },
			result: "mocked",
		});
		expect(provider.calls[0]?.request.url).toBe("https://api.example.com/v1/users/123?extra=x");
	});

	test("fetch() merges provider default options with call options before invoking the handler", async () => {
		const provider = new MockAPIProvider(
			request => {
				expect(request.headers.get("X-Default")).toBe("provider");
				expect(request.headers.get("X-Call")).toBe("call");
				expect(request.headers.get("Content-Type")).toBe("application/custom");
				return Response.json("ok");
			},
			{ url: "https://api.example.com/", options: { headers: { "X-Default": "provider", "Content-Type": "application/custom" } } },
		);
		const endpoint = POST("/items", DATA({ name: STRING }), STRING);

		expect(await provider.fetch(endpoint, { name: "abc" }, { headers: { "X-Call": "call" } })).toBe("ok");
		expect(provider.calls[0]?.options.headers).toEqual({
			"X-Default": "provider",
			"Content-Type": "application/custom",
			"X-Call": "call",
		});
	});

	test("fetch() throws ResponseError for invalid mocked responses (via ValidationAPIProvider)", async () => {
		const mock = new MockAPIProvider(async () => Response.json(false));
		const provider = new ValidationAPIProvider(mock);
		const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

		await expect(provider.fetch(endpoint, { id: "1" })).rejects.toBeInstanceOf(ResponseError);
		expect(mock.calls).toHaveLength(1);
	});
});
