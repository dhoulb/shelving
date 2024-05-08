import { expect, test } from "@jest/globals";
import { DAY, HOUR, formatWhen, getDuration } from "../index.js";

test("getDuration()", () => {
	expect(getDuration(10000000, 20000000)).toBe(-10000000);
});
test("formatWhen()", () => {
	expect(formatWhen(DAY, DAY * 2)).toBe("24h ago");
	expect(formatWhen(HOUR * 10, HOUR)).toBe("in 9h");
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "long" })).toBe("in 9 hours");
});
