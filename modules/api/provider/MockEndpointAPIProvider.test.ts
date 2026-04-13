import { describe, expect, test } from "bun:test";
import { APIProvider, DATA, GET, MockEndpointAPIProvider, NotFoundError, POST, STRING } from "../../index.js";

describe("MockEndpointAPIProvider", () => {
	test("fetch() routes requests through endpoint handlers and logs successful calls", async () => {
		const endpoint = POST("/users/{id}", DATA({ id: STRING, name: STRING }), STRING);
		const provider = new MockEndpointAPIProvider(
			[endpoint.handler(async ({ id, name }) => `${id}:${name}`)],
			undefined,
			new APIProvider({ url: "https://api.example.com/v1/" }),
		);

		expect(await provider.fetch(endpoint, { id: "123", name: "Ada" })).toBe("123:Ada");
		expect(provider.calls).toHaveLength(1);
		expect(provider.calls[0]).toMatchObject({
			type: "fetch",
			endpoint,
			payload: { id: "123", name: "Ada" },
			result: "123:Ada",
		});
		expect(provider.calls[0]?.request.url).toBe("https://api.example.com/v1/users/123");
	});

	test("fetch() passes the configured context to matching handlers", async () => {
		const endpoint = GET("/greet/{name}", DATA({ name: STRING }), STRING);
		const provider = new MockEndpointAPIProvider(
			[endpoint.handler(async ({ name }, _request, { prefix }: { prefix: string }) => `${prefix} ${name}`)],
			{ prefix: "Hello" },
			new APIProvider({ url: "https://api.example.com/v1/" }),
		);

		expect(await provider.fetch(endpoint, { name: "Ada" })).toBe("Hello Ada");
		expect(provider.calls[0]?.result).toBe("Hello Ada");
	});

	test("fetch() propagates unmatched endpoint errors without logging a completed call", async () => {
		const implemented = POST("/implemented", undefined, STRING);
		const requested = POST("/missing", undefined, STRING);
		const provider = new MockEndpointAPIProvider(
			[implemented.handler(async () => "ok")],
			undefined,
			new APIProvider({ url: "https://api.example.com/v1/" }),
		);

		await expect(provider.fetch(requested, undefined)).rejects.toBeInstanceOf(NotFoundError);
		expect(provider.calls).toHaveLength(0);
	});
});
