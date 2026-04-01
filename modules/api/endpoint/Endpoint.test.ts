import { describe, expect, test } from "bun:test";
import { DATA, GET, POST, STRING } from "../../index.js";

describe("Endpoint.toString()", () => {
	test("toString should include method and path", () => {
		const e = GET("/users");
		expect(e.toString()).toBe("GET /users");
		const p = POST("/items");
		expect(p.toString()).toBe("POST /items");
	});
});

describe("Endpoint.renderPath()", () => {
	test("renderPath returns path unchanged when there are no placeholders", () => {
		const e = GET("/static");
		expect(e.renderPath(undefined as never)).toBe("/static");
	});

	test("renderPath() replaces placeholders with payload values", () => {
		const e = GET("/users/{id}/sub/{sub}", DATA({ id: STRING, sub: STRING }));
		expect(e.renderPath({ id: "123", sub: "xyz" })).toBe("/users/123/sub/xyz");
	});
});

describe("Endpoint.match()", () => {
	test("match() returns path params for matching method/path", () => {
		const e = GET("/users/{id}", DATA({ id: STRING, extra: STRING }));
		expect(e.match("GET", "/users/123")).toEqual({ id: "123" });
	});

	test("match() returns undefined for mismatched methods", () => {
		const e = GET("/users/{id}", DATA({ id: STRING }), STRING);
		expect(e.match("POST", "/users/123")).toBeUndefined();
	});

	test("match() supports catchall paths", () => {
		const e = GET("/**", undefined, STRING);
		expect(e.match("GET", "/users/123")).toEqual({ "0": "users/123" });
	});
});
