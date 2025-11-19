import { describe, expect, test } from "bun:test";
import { DATA, GET, handleEndpoints, INTEGER, NotFoundError, requireNotNullish, STRING } from "../index.js";

const PAYLOAD = DATA({ id: INTEGER });

const handler1 = GET("https://x.com/test1/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello ${id}`);
const handler2a = GET("https://x.com/test2a/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello Test 2A ${id}`);
const handler2b = GET("https://x.com/test2b/{id}", PAYLOAD, STRING).handler(async ({ id }) => `Hello Test 2B ${id}`);
const handlers = [handler1, handler2a, handler2b];

const handlerAll = GET("https://x.com/**", undefined, STRING).handler(async () => "Catchall");

describe("handleEndpoints()", () => {
	test("Route works correctly", async () => {
		const req = new Request("https://x.com/test1/456", { method: "GET" });
		const response = await handleEndpoints(req, handlers);
		expect(response).toBeInstanceOf(Response);
		expect(await requireNotNullish(response).json()).toBe("Hello 456");
	});
	test("Catchall route works correctly", async () => {
		const req = new Request("https://x.com/aaaaaa", { method: "GET" });
		const response = await handleEndpoints(req, [...handlers, handlerAll]);
		expect(response).toBeInstanceOf(Response);
		expect(await requireNotNullish(response).json()).toBe("Catchall");
	});
	test("returns response from first matching endpoint handler if two would match", async () => {
		const req = new Request("https://x.com/test2a/789", { method: "GET" });
		const res = await handleEndpoints(req, handlers);
		expect(res).toBeInstanceOf(Response);
		expect(await res.json()).toBe("Hello Test 2A 789");
	});
	test("Throws NotFoundError if no endpoint handler matches", async () => {
		// No matching path.
		try {
			await handleEndpoints(new Request("http://x.com/", { method: "GET" }), handlers);
			expect(false).toBe(true);
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(NotFoundError);
		}

		// Mismatched method.
		try {
			await handleEndpoints(new Request("https://x.com/test1/123", { method: "POST" }), handlers);
			expect(false).toBe(true);
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(NotFoundError);
		}

		// Non-https method.
		try {
			await handleEndpoints(new Request("http://x.com/test/123", { method: "GET" }), handlers);
			expect(false).toBe(true);
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(NotFoundError);
		}
	});
});
