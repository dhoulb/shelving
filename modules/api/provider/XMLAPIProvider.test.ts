import { describe, expect, test } from "bun:test";
import { type Endpoint, GET, POST, XMLAPIProvider } from "shelving/api";
import { RequiredError } from "shelving/error";
import { DATA, STRING } from "shelving/schema";

describe("XMLAPIProvider", () => {
	test("createRequest() serializes POST payloads as XML bodies", async () => {
		const provider = new XMLAPIProvider({ url: "https://api.example.com/" });
		const endpoint = POST("/items", DATA({ item: DATA({ name: STRING }) }), STRING);
		const request = provider.createRequest(endpoint, { item: { name: "abc" } });

		expect(request.headers.get("Content-Type")).toBe("application/xml; charset=UTF-8");
		expect(await request.text()).toBe('<?xml version="1.0" encoding="UTF-8"?><item><name>abc</name></item>');
	});

	test("createRequest() rejects non-data XML payloads", () => {
		const provider = new XMLAPIProvider({ url: "https://api.example.com/" });
		const endpoint = POST("/items", STRING, STRING);
		expect(() => provider.createRequest(endpoint as Endpoint<any, string>, "abc")).toThrow(RequiredError);
	});

	test("fetch() parses responses as plain text", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response("<ok>true</ok>", { status: 200, headers: { "Content-Type": "application/xml" } });

			const provider = new XMLAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			expect(await provider.call(endpoint, { id: "1" })).toBe("<ok>true</ok>");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("fetch() throws ResponseError for non-ok responses using the raw text", async () => {
		const originalFetch = globalThis.fetch;
		try {
			// @ts-expect-error Testing replacement.
			globalThis.fetch = async () => new Response("<error>Teapot</error>", { status: 418, headers: { "Content-Type": "application/xml" } });

			const provider = new XMLAPIProvider({ url: "https://api.example.com/" });
			const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

			await expect(provider.call(endpoint, { id: "1" })).rejects.toMatchObject({ message: "<error>Teapot</error>", code: 418 });
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
