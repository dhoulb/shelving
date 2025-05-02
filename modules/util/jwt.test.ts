import { expect, test } from "bun:test";
import { UnauthorizedError, ValueError, encodeToken, verifyToken } from "../index.js";

const TOKEN_SECRET = "mytokensecretmytokensecretmytokensecret";
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
	const token = await encodeToken(TOKEN_CLAIMS, "BADSIGNATUREBADSIGNATUREBADSIGNATURE");
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/signature/);
});
test("Invalid token based on issued date", async () => {
	const token = await encodeToken({ ...TOKEN_CLAIMS, iat: Number.MAX_SAFE_INTEGER }, TOKEN_SECRET);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/not issued/);
});
test("Invalid token based on expiry", async () => {
	const token = await encodeToken({ ...TOKEN_CLAIMS, exp: 9999 }, TOKEN_SECRET);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(UnauthorizedError);
	expect(() => verifyToken(token, TOKEN_SECRET)).toThrow(/expired/);
});
