import { describe, expect, test } from "bun:test";
import { DATA, GET, MockEndpointAPIProvider, NotFoundError, POST, STRING } from "../../index.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";

describe("MockEndpointAPIProvider", () => {
	test("fetch() routes requests through endpoint handlers and logs successful calls", async () => {
		const endpoint = POST("/users/{id}", DATA({ id: STRING, name: STRING }), STRING);
		const provider = new MockEndpointAPIProvider(
			[endpoint.handler(async ({ id, name }) => `${id}:${name}`)],
			undefined,
			new ClientAPIProvider({ url: "https://api.example.com/v1/" }),
		);

		expect(await provider.call(endpoint, { id: "123", name: "Ada" })).toBe("123:Ada");
		expect(provider.requestCalls).toHaveLength(1);
		expect(provider.fetchCalls).toHaveLength(1);
		expect(provider.fetchCalls[0]?.request.url).toBe("https://api.example.com/v1/users/123");
		expect(provider.responseCalls).toHaveLength(1);
	});

	test("fetch() passes the configured context to matching handlers", async () => {
		const endpoint = GET("/greet/{name}", DATA({ name: STRING }), STRING);
		const provider = new MockEndpointAPIProvider(
			[
				endpoint.handler(async ({ name }, _request, { prefix }: { prefix: string }) => `${prefix} ${name}`), //
			],
			{ prefix: "Hello" },
		);

		try {
			expect(await provider.call(endpoint, { name: "Ada" })).toBe("Hello Ada");
			expect(provider.responseCalls[0]?.result).toBe("Hello Ada");
		} catch (thrown) {
			expect(thrown).toBe(undefined);
			expect.unreachable();
		}
	});

	test("fetch() propagates unmatched endpoint errors without logging a completed call", async () => {
		const implemented = POST("/implemented", undefined, STRING);
		const requested = POST("/missing", undefined, STRING);
		const provider = new MockEndpointAPIProvider([implemented.handler(async () => "ok")], undefined);

		await expect(provider.call(requested, undefined)).rejects.toBeInstanceOf(NotFoundError);
		expect(provider.fetchCalls).toHaveLength(0);
	});
});
