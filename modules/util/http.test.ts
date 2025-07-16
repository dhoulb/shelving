import { describe, expect, test } from "bun:test";
import { RequestError, ResponseError, getRequestContent, getResponseContent } from "../index.js";

function mockRequest(body: string, contentType: string): Request {
	return new Request("http://x.com/", {
		method: "POST",
		body,
		headers: { "Content-Type": contentType },
	});
}
function mockResponse(body: string, contentType: string): Response {
	return new Response(body, {
		headers: { "Content-Type": contentType },
	});
}

describe("getRequestContent()", () => {
	test("returns string for text/plain", async () => {
		expect(await getRequestContent(mockRequest("world", "text/plain"))).toBe("world");
		expect(await getRequestContent(mockRequest("123", "text/plain"))).toBe("123");
		expect(await getRequestContent(mockRequest("true", "text/plain"))).toBe("true");
		expect(await getRequestContent(mockRequest("", "text/plain"))).toBe("");
	});
	test("returns JSON for application/json", async () => {
		expect(await getRequestContent(mockRequest('{"w":4}', "application/json"))).toEqual({ w: 4 });
		expect(await getRequestContent(mockRequest("[1,2,3]", "application/json"))).toEqual([1, 2, 3]);
		expect(await getRequestContent(mockRequest('"abc"', "application/json"))).toEqual("abc");
		expect(await getRequestContent(mockRequest("123", "application/json"))).toEqual(123);
		expect(await getRequestContent(mockRequest("true", "application/json"))).toEqual(true);
		expect(await getRequestContent(mockRequest("false", "application/json"))).toEqual(false);
		expect(await getRequestContent(mockRequest("null", "application/json"))).toEqual(null);
		expect(await getRequestContent(mockRequest("", "application/json"))).toEqual(undefined);
	});
	test("throws for invalid JSON", async () => {
		const req = mockRequest("aaaaaa", "application/json");
		try {
			await getRequestContent(req);
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
	test("throws for unsupported content type", async () => {
		try {
			await getRequestContent(mockRequest("hi", "application/xml"));
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("getResponseContent()", () => {
	test("returns string for text/plain", async () => {
		expect(await getResponseContent(mockResponse("world", "text/plain"))).toBe("world");
	});
	test("returns JSON for application/json", async () => {
		expect(await getResponseContent(mockResponse('{"w":4}', "application/json"))).toEqual({ w: 4 });
		expect(await getResponseContent(mockResponse("[1,2,3]", "application/json"))).toEqual([1, 2, 3]);
		expect(await getResponseContent(mockResponse('"abc"', "application/json"))).toEqual("abc");
		expect(await getResponseContent(mockResponse("123", "application/json"))).toEqual(123);
		expect(await getResponseContent(mockResponse("true", "application/json"))).toEqual(true);
		expect(await getResponseContent(mockResponse("false", "application/json"))).toEqual(false);
		expect(await getResponseContent(mockResponse("null", "application/json"))).toEqual(null);
	});
	test("throws for invalid JSON", async () => {
		const req = mockResponse("aaaaaa", "application/json");
		try {
			await getResponseContent(req);
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
	test("throws for unsupported content type", async () => {
		try {
			await getResponseContent(mockResponse("hi", "application/xml"));
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
});
