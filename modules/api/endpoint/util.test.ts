import { describe, expect, test } from "bun:test";
import { DATA, GET, handleEndpoints, INTEGER, MethodNotAllowedError, STRING } from "../../index.js";

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
});
