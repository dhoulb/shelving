import { describe, expect, test } from "bun:test";
import { DATA, GET, handleEndpoints, INTEGER, MethodNotAllowedError, NotFoundError, POST, STRING, ValueError } from "../../index.js";

const PAYLOAD = DATA({ id: INTEGER });

const handler1 = GET("/test1/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello ${id}`);
const handler2a = GET("/test2a/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello Test 2A ${id}`);
const handler2b = GET("/test2b/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello Test 2B ${id}`);
const handlers = [handler1, handler2a, handler2b];

describe("handleEndpoints()", () => {
	test("throws MethodNotAllowedError for unsupported request methods", async () => {
		try {
			const req = new Request("https://x.com/v1/test1/456", { method: "OPTIONS" });
			await handleEndpoints(req, "https://x.com/v1/", handlers);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MethodNotAllowedError);
			expect((thrown as MethodNotAllowedError).code).toBe(405);
		}
	});

	test("strips the configured prefix before endpoint matching", async () => {
		const req = new Request("https://x.com/v1/test1/456", { method: "GET" });
		const response = await handleEndpoints(req, "https://x.com/v1/", handlers);
		expect(response).toBeInstanceOf(Response);
		expect(await response.json()).toBe("Hello 456");
	});

	test("merges query params with stripped path params", async () => {
		const endpoint = GET("/test/{id}", DATA({ id: INTEGER, extra: STRING }), STRING);
		const handler = endpoint.handler(async ({ id, extra }, request) => `${id}:${extra}:${new URL(request.url).pathname}`);
		const req = new Request("https://x.com/v1/test/456?extra=x", { method: "GET" });
		const response = await handleEndpoints(req, "https://x.com/v1/", [handler]);
		expect(await response.json()).toBe("456:x:/v1/test/456");
	});

	test("matches the root endpoint when the request path equals the base path", async () => {
		const handler = GET("/", undefined, STRING).handler(async () => "root");
		const response = await handleEndpoints(new Request("https://x.com/v1", { method: "GET" }), "https://x.com/v1/", [handler]);
		expect(await response.json()).toBe("root");
	});

	test("throws NotFoundError when the request origin does not match the configured base", async () => {
		expect(() => handleEndpoints(new Request("https://y.com/v1/test1/456", { method: "GET" }), "https://x.com/v1/", handlers)).toThrow(
			NotFoundError,
		);
	});

	test("throws NotFoundError when the stripped path does not match any endpoint", async () => {
		expect(() => handleEndpoints(new Request("https://x.com/v1/unknown", { method: "GET" }), "https://x.com/v1/", handlers)).toThrow(
			NotFoundError,
		);
	});

	test("merges JSON body with query and path params, with params taking precedence", async () => {
		const endpoint = POST("/test/{id}", DATA({ id: INTEGER, extra: STRING }), STRING);
		const handler = endpoint.handler(async ({ id, extra }) => `${id}:${extra}`);
		const req = new Request("https://x.com/v1/test/456?extra=query", {
			method: "POST",
			body: JSON.stringify({ id: 999, extra: "body" }),
			headers: { "Content-Type": "application/json" },
		});
		const response = await handleEndpoints(req, "https://x.com/v1/", [handler]);
		expect(await response.json()).toBe("456:query");
	});

	test("passes non-object request bodies straight through to payload validation", async () => {
		const endpoint = POST("/text", STRING, STRING);
		const handler = endpoint.handler(async payload => payload.toUpperCase());
		const req = new Request("https://x.com/v1/text", {
			method: "POST",
			body: "hello",
			headers: { "Content-Type": "text/plain" },
		});
		const response = await handleEndpoints(req, "https://x.com/v1/", [handler]);
		expect(await response.json()).toBe("HELLO");
	});

	test("passes additional callback arguments through to handlers", async () => {
		const endpoint = GET("/args/{id}", PAYLOAD, STRING);
		const handler = endpoint.handler(async ({ id }, _request, prefix: string, suffix: string) => `${prefix}:${id}:${suffix}`);
		const response = await handleEndpoints(
			new Request("https://x.com/v1/args/456", { method: "GET" }),
			"https://x.com/v1/",
			[handler],
			"a",
			"b",
		);
		expect(await response.json()).toBe("a:456:b");
	});

	test("returns 204 for undefined handler results", async () => {
		const handler = GET("/empty").handler(async () => undefined);
		const response = await handleEndpoints(new Request("https://x.com/v1/empty", { method: "GET" }), "https://x.com/v1/", [handler]);
		expect(response.status).toBe(204);
		expect(await response.text()).toBe("");
	});

	test("throws ValueError for invalid handler results", async () => {
		const handler = GET("/bad", undefined, STRING).handler(async () => false as never);
		await expect(
			handleEndpoints(new Request("https://x.com/v1/bad", { method: "GET" }), "https://x.com/v1/", [handler]),
		).rejects.toBeInstanceOf(ValueError);
	});

	test("passes Response objects returned by handlers through unchanged", async () => {
		const handler = GET("/response", undefined, STRING).handler(async () => new Response("raw", { status: 201 }));
		const response = await handleEndpoints(new Request("https://x.com/v1/response", { method: "GET" }), "https://x.com/v1/", [handler]);
		expect(response.status).toBe(201);
		expect(await response.text()).toBe("raw");
	});
});
