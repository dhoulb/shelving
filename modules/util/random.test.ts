import { getRandomItem, getRandomCharacter, getRandomKey, getRandom } from "../index.js";

test("getRandomCharacter()", () => {
	expect(typeof getRandomCharacter("abc")).toBe("string");
	expect(getRandomCharacter("abc").length).toBe(1);
});
test("getRandomKey()", () => {
	expect(typeof getRandomKey()).toBe("string");
	expect(getRandomKey(24).length).toBe(24);
});
test("getRandomItem()", () => {
	const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	expect(getRandomItem(arr)).not.toBe(undefined);
	expect(arr.includes(getRandomItem(arr))).toBe(true);
});
test("getRandom()", () => {
	expect(typeof getRandom(1, 2)).toBe("number");
	expect(getRandom(1, 99)).toBeGreaterThanOrEqual(1);
	expect(getRandom(1, 99)).toBeLessThanOrEqual(99);
});
