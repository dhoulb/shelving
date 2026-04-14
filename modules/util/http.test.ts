import { describe, expect, test } from "bun:test";
import {
	getFormDataRequest,
	getJSONRequest,
	getTextRequest,
	getXMLRequest,
	isRequestHeadMethod,
	parseRequestBody,
	parseRequestFormData,
	parseRequestJSON,
	parseResponseBody,
	parseResponseFormData,
	parseResponseJSON,
	RequestError,
} from "../index.js";

function mockRequest(body: string | null, contentType?: string, method = "POST"): Request {
	return new Request("http://x.com/", {
		method,
		body,
		...(contentType ? { headers: { "Content-Type": contentType } } : {}),
	});
}
function mockResponse(body: string, contentType?: string, status = 200): Response {
	return new Response(body, contentType ? { status, headers: { "Content-Type": contentType } } : { status });
}

describe("isRequestHeadMethod()", () => {
	test("returns true for HEAD and GET only", () => {
		expect(isRequestHeadMethod("GET")).toBe(true);
		expect(isRequestHeadMethod("HEAD")).toBe(true);
		expect(isRequestHeadMethod("POST")).toBe(false);
	});
});

describe("parseRequestBody()", () => {
	test("returns undefined for no content type", async () => {
		expect(await parseRequestBody(mockRequest("abc"))).toBe(undefined);
		expect(await parseRequestBody(mockRequest(null))).toBe(undefined);
	});
	test("returns string for text/* content type", async () => {
		expect(await parseRequestBody(mockRequest("world", "text/plain"))).toBe("world");
		expect(await parseRequestBody(mockRequest("123", "text/plain"))).toBe("123");
		expect(await parseRequestBody(mockRequest("true", "text/plain"))).toBe("true");
		expect(await parseRequestBody(mockRequest("", "text/plain"))).toBe("");
		expect(await parseRequestBody(mockRequest("world", "text/xml"))).toBe("world");
		expect(await parseRequestBody(mockRequest("123", "text/xml"))).toBe("123");
		expect(await parseRequestBody(mockRequest("true", "text/xml"))).toBe("true");
		expect(await parseRequestBody(mockRequest("", "text/xml"))).toBe("");
		expect(await parseRequestBody(mockRequest(null, "text/plain"))).toBe("");
	});
	test("undefined for unknown content type", async () => {
		expect(await parseRequestBody(mockRequest("a", "application/xml"))).toBeUndefined();
		expect(await parseRequestBody(mockRequest("b", "something/else"))).toBeUndefined();
	});
	test("returns JSON for application/json content type", async () => {
		expect(await parseRequestBody(mockRequest('{"w":4}', "application/json"))).toEqual({ w: 4 });
		expect(await parseRequestBody(mockRequest("[1,2,3]", "application/json"))).toEqual([1, 2, 3]);
		expect(await parseRequestBody(mockRequest('"abc"', "application/json"))).toEqual("abc");
		expect(await parseRequestBody(mockRequest("123", "application/json"))).toEqual(123);
		expect(await parseRequestBody(mockRequest("true", "application/json"))).toEqual(true);
		expect(await parseRequestBody(mockRequest("false", "application/json"))).toEqual(false);
		expect(await parseRequestBody(mockRequest("null", "application/json"))).toEqual(null);
		expect(await parseRequestBody(mockRequest("", "application/json"))).toEqual(undefined);
		expect(await parseRequestBody(mockRequest(null, "application/json"))).toEqual(undefined);
	});
	test("throws for application/json content type with invalid JSON", async () => {
		const req = mockRequest("aaaaaa", "application/json");
		try {
			await parseRequestBody(req);
			expect.unreachable();
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("parseRequestJSON()", () => {
	test("parses JSON requests", async () => {
		expect(await parseRequestJSON(mockRequest('{"w":4}', "application/json"))).toEqual({ w: 4 });
	});

	test("returns undefined for GET requests", async () => {
		expect(await parseRequestJSON(new Request("http://x.com/", { method: "GET" }))).toBeUndefined();
	});
});

describe("parseRequestFormData()", () => {
	test("parses multipart requests", async () => {
		const body = new FormData();
		body.set("name", "abc");
		const request = new Request("http://x.com/", { method: "POST", body });
		expect((await parseRequestFormData(request))?.get("name")).toBe("abc");
	});
});

describe("parseResponseBody()", () => {
	test("returns string for text/plain", async () => {
		expect(await parseResponseBody(mockResponse("world", "text/plain"))).toBe("world");
	});

	test("returns correct response for no-content responses", async () => {
		expect(await parseResponseBody(new Response(undefined, { status: 200, headers: { "Content-Type": "text/plain" } }))).toBe("");
		expect(await parseResponseBody(new Response(undefined, { status: 204, headers: { "Content-Type": "text/plain" } }))).toBe("");
		expect(await parseResponseBody(new Response(undefined, { status: 200, headers: { "Content-Type": "application/json" } }))).toBe(
			undefined,
		);
		expect(await parseResponseBody(new Response(undefined, { status: 204, headers: { "Content-Type": "application/json" } }))).toBe(
			undefined,
		);
	});
});

describe("parseResponseJSON()", () => {
	test("parses JSON responses", async () => {
		expect(await parseResponseJSON(mockResponse('{"w":4}', "application/json"))).toEqual({ w: 4 });
	});

	test("returns undefined for no-content responses", async () => {
		expect(
			await parseResponseJSON(new Response(undefined, { status: 204, headers: { "Content-Type": "application/json" } })),
		).toBeUndefined();
	});
});

describe("parseResponseFormData()", () => {
	test("parses multipart responses", async () => {
		const body = new FormData();
		body.set("name", "abc");
		const response = new Response(body);
		expect((await parseResponseFormData(response))?.get("name")).toBe("abc");
	});
});

describe("request builders", () => {
	test("getTextRequest() creates a text request", async () => {
		const request = getTextRequest("POST", "https://example.com/items", "hello");
		expect(request.headers.get("Content-Type")).toBe("text/plain");
		expect(await request.text()).toBe("hello");
	});

	test("getJSONRequest() creates a JSON request", async () => {
		const request = getJSONRequest("POST", "https://example.com/items", { name: "abc" });
		expect(request.headers.get("Content-Type")).toBe("application/json");
		expect(await request.text()).toBe('{"name":"abc"}');
	});

	test("getFormDataRequest() creates a form-data request", async () => {
		const body = new FormData();
		body.set("name", "abc");

		const request = getFormDataRequest("POST", "https://example.com/items", body);
		expect((await request.formData()).get("name")).toBe("abc");
	});

	test("getXMLRequest() creates an XML request", async () => {
		const request = getXMLRequest("POST", "https://example.com/items", { item: { name: "abc" } });
		expect(request.headers.get("Content-Type")).toBe("application/xml; charset=UTF-8");
		expect(await request.text()).toBe('<?xml version="1.0" encoding="UTF-8"?><item><name>abc</name></item>');
	});
});
