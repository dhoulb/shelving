import { describe, expect, test } from "bun:test";
import { getRequestContent, getResponseContent, RequestError } from "../index.js";

function mockRequest(body: string, contentType?: string): Request {
	return new Request("http://x.com/", {
		method: "POST",
		body,
		...(contentType ? { headers: { "Content-Type": contentType } } : {}),
	});
}
function mockResponse(body: string, contentType?: string): Response {
	return new Response(body, contentType ? { headers: { "Content-Type": contentType } } : undefined);
}

describe("getRequestContent()", () => {
	test("returns undefined for no content type", async () => {
		expect(await getRequestContent(mockRequest("abc"))).toBe("abc");
	});
	test("returns string for text/* content type", async () => {
		expect(await getRequestContent(mockRequest("world", "text/plain"))).toBe("world");
		expect(await getRequestContent(mockRequest("123", "text/plain"))).toBe("123");
		expect(await getRequestContent(mockRequest("true", "text/plain"))).toBe("true");
		expect(await getRequestContent(mockRequest("", "text/plain"))).toBe("");
		expect(await getRequestContent(mockRequest("world", "text/xml"))).toBe("world");
		expect(await getRequestContent(mockRequest("123", "text/xml"))).toBe("123");
		expect(await getRequestContent(mockRequest("true", "text/xml"))).toBe("true");
		expect(await getRequestContent(mockRequest("", "text/xml"))).toBe("");
	});
	test("undefined for unknown content type", async () => {
		expect(await getRequestContent(mockRequest("a", "application/xml"))).toBeUndefined();
		expect(await getRequestContent(mockRequest("b", "something/else"))).toBeUndefined();
	});
	test("returns JSON for application/json content type", async () => {
		expect(await getRequestContent(mockRequest('{"w":4}', "application/json"))).toEqual({ w: 4 });
		expect(await getRequestContent(mockRequest("[1,2,3]", "application/json"))).toEqual([1, 2, 3]);
		expect(await getRequestContent(mockRequest('"abc"', "application/json"))).toEqual("abc");
		expect(await getRequestContent(mockRequest("123", "application/json"))).toEqual(123);
		expect(await getRequestContent(mockRequest("true", "application/json"))).toEqual(true);
		expect(await getRequestContent(mockRequest("false", "application/json"))).toEqual(false);
		expect(await getRequestContent(mockRequest("null", "application/json"))).toEqual(null);
		expect(await getRequestContent(mockRequest("", "application/json"))).toEqual(undefined);
	});
	test("throws for application/json content type with invalid JSON", async () => {
		const req = mockRequest("aaaaaa", "application/json");
		try {
			await getRequestContent(req);
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("getResponseContent()", () => {
	test("returns string for text/plain", async () => {
		expect(await getResponseContent(mockResponse("world", "text/plain"))).toBe("world");
	});
	// No more tests needed as they test the same logic as `getRequestContent()`
});
