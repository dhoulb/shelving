import { describe, expect, test } from "bun:test";
import { DATA, GET, POST, ResponseError, STRING, UNKNOWN } from "../index.js";

describe("Endpoint.toString()", () => {
	test("toString should include method and URL", () => {
		const e = GET("https://api.example.com/users");
		expect(e.toString()).toBe("GET https://api.example.com/users");
		const p = POST("https://api.example.com/items");
		expect(p.toString()).toBe("POST https://api.example.com/items");
	});
});
describe("Endpoint.renderURL()", () => {
	test("renderURL returns URL unchanged when there are no placeholders", () => {
		const e = GET("https://api.example.com/static");
		// renderURL should return the same URL when no {placeholders} exist
		expect(e.render(undefined as any)).toBe("https://api.example.com/static");
	});
	test("renderURL() replaces placeholders with payload values", () => {
		const e = GET("https://api.example.com/users/{id}/sub/{sub}", DATA({ id: STRING, sub: STRING }));
		expect(e.render({ id: "123", sub: "xyz" })).toBe("https://api.example.com/users/123/sub/xyz");
	});
});
describe("GET", () => {
	test("GET requests render placeholders and adds remaining payload as query params", () => {
		const e = GET("https://api.example.com/users/{id}", DATA({ id: STRING, extra: STRING }));
		const req = e.request({ id: "1", extra: "x" });
		expect(req.method).toBe("GET");
		expect(req.url).toBe("https://api.example.com/users/1?extra=x");
	});
});
describe("POST", () => {
	test("POST requests set JSON body and Content-Type header", async () => {
		const p = POST("https://api.example.com/items", DATA({ name: STRING }), STRING);
		const req = p.request({ name: "abc" });
		expect(req.method).toBe("POST");
		expect(req.headers.get("Content-Type")).toBe("application/json");
		const body = await req.text();
		expect(body).toBe(JSON.stringify({ name: "abc" }));
	});
	test("POST requests set FormData body and Content-Type header", async () => {
		const p = POST("https://api.example.com/items", UNKNOWN, STRING);
		const data = new FormData();
		data.set("name", "abc");
		const req = p.request(data);
		expect(req.method).toBe("POST");
		expect(req.headers.get("Content-Type")).toStartWith("multipart/form-data; ");
		const body = await req.formData();
		expect(body.get("name")).toBe("abc");
	});
	test("POST requests set string body and Content-Type header", async () => {
		const p = POST("https://api.example.com/items", STRING, STRING);
		const req = p.request("abcdef");
		expect(req.method).toBe("POST");
		expect(req.headers.get("Content-Type")).toBe("text/plain");
		const body = await req.text();
		expect(body).toBe("abcdef");
	});
});
describe("Endpoint.fetch()", () => {
	test("fetch() works with application/json type", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Just for testing.
			globalThis.fetch = async () =>
				new Response(JSON.stringify("Hello from fetch"), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			const endpoint = GET("https://api.example.com/echo", DATA({ id: STRING }), STRING);
			const result = await endpoint.fetch({ id: "1" });
			expect(result).toBe("Hello from fetch");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
	test("fetch() throws ResponseError if returned type is invalid", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Just for testing.
			globalThis.fetch = async () =>
				new Response(
					JSON.stringify(false), // false is not STRING.
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			const endpoint = GET("https://api.example.com/echo", DATA({ id: STRING }), STRING);
			const result = await endpoint.fetch({ id: "1" });
			expect(false).toBe(true);
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ResponseError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
	test("fetch() works with text/plain response", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Just for testing.
			globalThis.fetch = async () =>
				new Response("Hello from fetch", {
					status: 200,
				});
			const endpoint = GET("https://api.example.com/echo", DATA({ id: STRING }), STRING);
			const result = await endpoint.fetch({ id: "1" });
			expect(result).toBe("Hello from fetch");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
