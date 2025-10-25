import { expect, test } from "bun:test";
import { getMillisecondsUntil } from "./duration.js";

test("getMillisecondsUntil()", () => {
	expect(getMillisecondsUntil(10000000, 20000000)).toBe(-10000000);
});
