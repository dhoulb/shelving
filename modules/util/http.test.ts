import { describe, expect, test } from "bun:test";
import {
	NotFoundError,
	RequestError,
	ResponseError,
	getRequestBody,
	getRequestData,
	getRequestJSON,
	getResponseBody,
	getResponseData,
	getResponseJSON,
	handleRequest,
	requireRequestData,
	requireResponseData,
} from "../index.js";

function mockRequest(body: string, contentType = "application/json"): Request {
	return new Request("http://x.com/", {
		method: "POST",
		body,
		headers: { "Body-Type": contentType },
	});
}
function mockResponse(body: string, contentType = "application/json"): Response {
	return new Response(body, {
		headers: { "Body-Type": contentType },
	});
}

describe("getRequestJSON()", () => {
	test("parses valid JSON", async () => {
		const req = mockRequest('{"a":1}');
		expect(await getRequestJSON(req)).toEqual({ a: 1 });
	});
	test("throws on invalid JSON", async () => {
		const req = mockRequest("not-json");
		try {
			await getRequestJSON(req);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("getResponseJSON()", () => {
	test("parses valid JSON", async () => {
		const res = mockResponse('{"b":2}');
		expect(await getResponseJSON(res)).toEqual({ b: 2 });
	});
	test("throws on invalid JSON", async () => {
		const res = mockResponse("not-json");
		try {
			await getResponseJSON(res);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
});

describe("getRequestData()", () => {
	test("returns object for valid data", async () => {
		const req = mockRequest('{"x":1}');
		expect(await getRequestData(req)).toEqual({ x: 1 });
	});
	test("returns undefined for empty body", async () => {
		const req = mockRequest("");
		expect(await getRequestData(req)).toBeUndefined();
	});
	test("throws for non-object JSON", async () => {
		const req = mockRequest("123");
		try {
			await getRequestData(req);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("getResponseData()", () => {
	test("returns object for valid data", async () => {
		const res = mockResponse('{"y":2}');
		expect(await getResponseData(res)).toEqual({ y: 2 });
	});
	test("returns undefined for empty body", async () => {
		const res = mockResponse("");
		expect(await getResponseData(res)).toBeUndefined();
	});
	test("throws for non-object JSON", async () => {
		const res = mockResponse("123");
		try {
			await getResponseData(res);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
});

describe("requireRequestData()", () => {
	test("returns object for valid data", async () => {
		const req = mockRequest('{"foo":1}');
		expect(await requireRequestData(req)).toEqual({ foo: 1 });
	});
	test("throws for empty body", async () => {
		const req = mockRequest("");
		try {
			await requireRequestData(req);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
	test("throws for non-object JSON", async () => {
		const req = mockRequest("123");
		try {
			await requireRequestData(req);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("requireResponseData()", () => {
	test("returns object for valid data", async () => {
		const res = mockResponse('{"bar":2}');
		expect(await requireResponseData(res)).toEqual({ bar: 2 });
	});
	test("throws for empty body", async () => {
		const res = mockResponse("");
		try {
			await requireResponseData(res);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
	test("throws for non-object JSON", async () => {
		const res = mockResponse("123");
		try {
			await requireResponseData(res);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
});

describe("getRequestBody()", () => {
	test("returns string for text/plain", async () => {
		const req = mockRequest("hello", "text/plain");
		expect(await getRequestBody(req)).toBe("hello");
	});
	test("returns object for application/json", async () => {
		const req = mockRequest('{"z":3}');
		expect(await getRequestBody(req)).toEqual({ z: 3 });
	});
	test("throws for unsupported content type", async () => {
		const req = mockRequest("hi", "application/xml");
		try {
			await getRequestBody(req);
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
		}
	});
});

describe("getResponseBody()", () => {
	test("returns string for text/plain", async () => {
		const res = mockResponse("world", "text/plain");
		expect(await getResponseBody(res)).toBe("world");
	});
	test("returns object for application/json", async () => {
		const res = mockResponse('{"w":4}');
		expect(await getResponseBody(res)).toEqual({ w: 4 });
	});
	test("throws for unsupported content type", async () => {
		const res = mockResponse("hi", "application/xml");
		try {
			await getResponseBody(res);
		} catch (error) {
			expect(error).toBeInstanceOf(ResponseError);
		}
	});
});

describe("handleRequest()", () => {
	test("returns response from first matching handler", async () => {
		const handlers = [() => undefined, () => new Response("ok")];
		const req = mockRequest("{}");
		const res = await handleRequest(req, handlers);
		expect(res).toBeInstanceOf(Response);
		expect(await res.text()).toBe("ok");
	});
	test("throws NotFoundError if no handler matches", () => {
		const handlers = [() => undefined];
		const req = mockRequest("{}");
		expect(() => handleRequest(req, handlers)).toThrow(NotFoundError);
	});
});
