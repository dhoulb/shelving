import { randomItem, randomCharacter, randomId, randomInteger } from "../index.js";

test("randomCharacter()", () => {
	expect(typeof randomCharacter()).toBe("string");
	expect(randomCharacter().length).toBe(1);
});
test("randomId()", () => {
	expect(typeof randomId()).toBe("string");
	expect(randomId().length).toBe(16);
	expect(randomId(24).length).toBe(24);
});
test("randomItem()", () => {
	const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	expect(randomItem(arr)).not.toBe(undefined);
	expect(arr.includes(randomItem(arr))).toBe(true);
});
test("randomNumber()", () => {
	expect(typeof randomInteger(1, 2)).toBe("number");
	expect(randomInteger(1, 99)).toBeGreaterThanOrEqual(1);
	expect(randomInteger(1, 99)).toBeLessThanOrEqual(99);
});
