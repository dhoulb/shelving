import { describe, expect, test } from "bun:test";
import { ValueError } from "shelving/error";
import { hashPassword, verifyPassword } from "shelving/util/crypto";

const PASSWORD = "mysecretpassword";

describe("hashPassword()", () => {
	test("Hashes without error", async () => {
		const hash = await hashPassword(PASSWORD);
		expect(typeof hash).toBe("string");
		expect(hash.length).toBeGreaterThan(10);
		expect(hash).toMatch(/[a-zA-Z0-9-_]+\$[0-9]+\$[a-zA-Z0-9-_]+/);
	});
	test("Fails for short password", async () => {
		try {
			await hashPassword("abc");
			expect.unreachable();
		} catch (err) {
			expect(err).toBeInstanceOf(ValueError);
		}
	});
});
describe("verifyPassword()", () => {
	test("Works correctly", async () => {
		const hash = await hashPassword(PASSWORD);
		const result = await verifyPassword(PASSWORD, hash);
		expect(result).toBe(true);
	});
	test("Fails for wrong password", async () => {
		const hash = await hashPassword(PASSWORD);
		const result = await verifyPassword("wrongpassword", hash);
		expect(result).toBe(false);
	});
	test("Fails for for empty password", async () => {
		const hash = await hashPassword(PASSWORD);
		const result = await verifyPassword("", hash);
		expect(result).toBe(false);
	});
	test("Fails for for long password", async () => {
		const hash = await hashPassword(PASSWORD);
		const result = await verifyPassword("", hash);
		expect(result).toBe(false);
	});
});
