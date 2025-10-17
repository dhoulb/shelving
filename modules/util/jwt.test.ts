import { describe, expect, test } from "bun:test";
import {
	DAY,
	encodeToken,
	getRequestToken,
	requireRequestToken,
	setRequestToken,
	UnauthorizedError,
	ValueError,
	verifyRequestToken,
	verifyToken,
} from "../index.js";

const TOKEN_SECRET = "mytokensecretmytokensecretmytokensecretmytokensecretmytokensecretmytokensecret";
const TOKEN_ISSUER = "mytokenissuer";
const TOKEN_SUBSCRIBER = "abc";
const TOKEN_CLAIMS = {
	iss: TOKEN_ISSUER,
	sub: TOKEN_SUBSCRIBER,
};

test("Create and verify token", async () => {
	const token = await encodeToken(TOKEN_CLAIMS, TOKEN_SECRET);
	const payload = await verifyToken(token, TOKEN_SECRET);
	expect(typeof payload.iat).toBe("number");
	expect(typeof payload.exp).toBe("number");
	expect(payload.iss).toBe(TOKEN_ISSUER);
	expect(payload.sub).toBe(TOKEN_SUBSCRIBER);
});
test("Invalid secret param", async () => {
	const token = await encodeToken(TOKEN_CLAIMS, TOKEN_SECRET);
	expect(() => verifyToken(token, "")).toThrow(ValueError);
	expect(() => verifyToken(token, "")).toThrow(/secret/);
});
test("Invalid token based on signature", async () => {
	const token = await encodeToken(TOKEN_CLAIMS, "BADSIGNATUREBADSIGNATUREBADSIGNATUREBADSIGNATUREBADSIGNATUREBADSIGNATURE");
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/signature/);
});
test("Invalid token based on issued date", async () => {
	const token = await encodeToken({ ...TOKEN_CLAIMS, iat: Date.now() / 1000 + DAY }, TOKEN_SECRET);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/issued/);
});
test("Invalid token based on not before date", async () => {
	const token = await encodeToken({ ...TOKEN_CLAIMS, nbf: Date.now() / 1000 + DAY }, TOKEN_SECRET);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/used/);
});
test("Invalid token based on expiry", async () => {
	const token = await encodeToken({ ...TOKEN_CLAIMS, exp: Date.now() / 1000 - DAY }, TOKEN_SECRET);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/expired/);
});
test("setRequestToken()", () => {
	const req = new Request("https://example.com");
	setRequestToken(req, "testtoken");
	expect(req.headers.get("Authorization")).toBe("Bearer testtoken");
});
test("getRequestToken()", () => {
	const req = new Request("https://example.com");
	setRequestToken(req, "testtoken");
	expect(getRequestToken(req)).toBe("testtoken");
});
describe("requireRequestToken()", () => {
	test("works correctly", () => {
		const req = new Request("https://example.com");
		setRequestToken(req, "testtoken");
		expect(requireRequestToken(req)).toBe("testtoken");
	});
	test("throws if not set", () => {
		const req = new Request("https://example.com");
		try {
			requireRequestToken(req);
		} catch (error) {
			expect(error).toBeInstanceOf(UnauthorizedError);
		}
	});
	test("returns token if set", () => {
		const req = new Request("https://example.com");
		setRequestToken(req, "requiredtoken");
		expect(requireRequestToken(req)).toBe("requiredtoken");
	});
});
describe("verifyRequestToken()", () => {
	test("returns payload for valid token", async () => {
		const req = new Request("https://example.com");
		const token = await encodeToken(TOKEN_CLAIMS, TOKEN_SECRET);
		setRequestToken(req, token);
		const payload = await verifyRequestToken(req, TOKEN_SECRET);
		expect(payload.iss).toBe(TOKEN_ISSUER);
		expect(payload.sub).toBe(TOKEN_SUBSCRIBER);
	});
	test("throws for invalid token", async () => {
		const req = new Request("https://example.com");
		setRequestToken(req, "invalidtoken");
		try {
			await verifyRequestToken(req, TOKEN_SECRET);
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(UnauthorizedError);
		}
	});
});
