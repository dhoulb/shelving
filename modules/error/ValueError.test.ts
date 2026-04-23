import { describe, expect, test } from "bun:test";
import { ValueError } from "../index.js";

describe("ValueError", () => {
	test("caller argument works correctly in ValueError", () => {
		function myFunctionA() {
			throw new ValueError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect.unreachable();
		} catch (error) {
			expect(error).toBeInstanceOf(ValueError);
			if (error instanceof ValueError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect.unreachable();
			}
		}
	});
});
