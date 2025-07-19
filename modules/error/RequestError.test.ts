import { describe, expect, test } from "bun:test";
import { ForbiddenError, NotFoundError, RequestError, UnauthorizedError, UnprocessableError } from "../index.js";

describe("RequestError", () => {
	test("code is correct", () => {
		expect(new RequestError().code).toBe(400);
	});
	test("caller argument works correctly in RequestError", () => {
		function myFunctionA() {
			throw new RequestError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(RequestError);
			if (error instanceof RequestError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
describe("NotFoundError", () => {
	test("code is correct", () => {
		expect(new NotFoundError().code).toBe(404);
	});
	test("caller argument works correctly in NotFoundError", () => {
		function myFunctionA() {
			throw new NotFoundError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(NotFoundError);
			if (error instanceof NotFoundError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
describe("UnauthorizedError", () => {
	test("code is correct", () => {
		expect(new UnauthorizedError().code).toBe(401);
	});
	test("caller argument works correctly in UnauthorizedError", () => {
		function myFunctionA() {
			throw new UnauthorizedError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(UnauthorizedError);
			if (error instanceof UnauthorizedError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
describe("UnprocessableError", () => {
	test("code is correct", () => {
		expect(new UnprocessableError().code).toBe(422);
	});
	test("caller argument works correctly in UnprocessableError", () => {
		function myFunctionA() {
			throw new UnprocessableError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(UnprocessableError);
			if (error instanceof UnprocessableError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
describe("ForbiddenError", () => {
	test("code is correct", () => {
		expect(new ForbiddenError().code).toBe(403);
	});
	test("caller argument works correctly in ForbiddenError", () => {
		function myFunctionA() {
			throw new ForbiddenError("abc", { caller: myFunctionA });
		}
		function myFunctionB() {
			myFunctionA();
		}

		try {
			myFunctionB();
			expect(false).toBe(true);
		} catch (error) {
			expect(error).toBeInstanceOf(ForbiddenError);
			if (error instanceof ForbiddenError) {
				expect(error.stack).toInclude("myFunctionB");
				expect(error.stack).not.toInclude("myFunctionA");
			} else {
				expect(false).toBe(true);
			}
		}
	});
});
