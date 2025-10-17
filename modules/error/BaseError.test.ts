import { describe, expect, test } from "bun:test";
import { BaseError, ValueError } from "../index.js";

describe("BaseError", () => {
	test("caller argument works correctly in BaseError", () => {
		function myFunctionA() {
			// @ts-expect-error: We want to directly test BaseError
			throw new BaseError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(BaseError);
			if (error instanceof BaseError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
	test("caller argument works correctly in extended class of BaseError", () => {
		function myFunctionA() {
			throw new ValueError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(ValueError);
			if (error instanceof ValueError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
