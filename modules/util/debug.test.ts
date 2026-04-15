import { describe, expect, test } from "bun:test";
import { debug, debugFullRequest, debugFullResponse, debugHeaders } from "../index.js";

describe("debugHeaders()", () => {
	test("formats headers correctly", () => {
		const headers = new Headers({ "Content-Type": "application/json", "Content-Length": "123" });
		expect(debugHeaders(headers)).toBe("content-length: 123\ncontent-type: application/json");
	});
});

describe("debugRequest()", () => {
	test("formats the request without consuming it", async () => {
		const request = new Request("https://example.com/items", {
			method: "POST",
			body: JSON.stringify({ name: "abc" }),
			headers: { "Content-Type": "application/json", "Content-Length": "123" },
		});

		expect(await debugFullRequest(request)).toBe(
			'POST https://example.com/items\ncontent-length: 123\ncontent-type: application/json\n\n{"name":"abc"}',
		);
		expect(await request.text()).toBe('{"name":"abc"}');
	});
});

describe("debugResponse()", () => {
	test("formats the response without consuming it", async () => {
		const response = new Response("BODY", { status: 200, statusText: "OK", headers: { "Content-Type": "text/plain" } });

		expect(await debugFullResponse(response)).toBe("200 OK\ncontent-type: text/plain\n\nBODY");
		expect(await response.text()).toBe("BODY");
	});

	test("falls back to standard status text", async () => {
		expect(await debugFullResponse(new Response("ok", { status: 200, statusText: "OK" }))).toBe("200 OK\n\nok");
	});
});

describe("debug()", () => {
	test("formats request summaries", () => {
		expect(debug(new Request("https://example.com/items", { method: "POST" }))).toBe("POST https://example.com/items");
	});

	test("formats response summaries", () => {
		expect(debug(new Response(null, { status: 200, statusText: "OK" }))).toBe("200 OK");
	});
});
