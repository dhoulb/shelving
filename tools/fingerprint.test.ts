import { fingerprint } from "./fingerprint";

describe("fingerprint()", () => {
	test("Works correctly", () => {
		// Primitives.
		expect(fingerprint(true)).toBe("true");
		expect(fingerprint(false)).toBe("false");
		expect(fingerprint(null)).toBe("null");
		expect(fingerprint(undefined)).toBe("undefined");
		expect(fingerprint(123)).toBe("123");
		expect(fingerprint(123.456)).toBe("123.456");
		expect(fingerprint("abc")).toBe(`"abc"`);

		// Symbols.
		expect(fingerprint(Symbol("abc"))).toBe(`Symbol(abc)`);
		expect(fingerprint(Symbol())).toBe(`Symbol()`);

		// Arrays.
		expect(fingerprint([1, 2, 3])).toBe("[1,2,3]");
		expect(fingerprint([Symbol("abc"), function named() {}])).toBe("[Symbol(abc),named()]");

		// Objects.
		expect(fingerprint({ a: 1, b: 2 })).toBe(`{"a":1,"b":2}`);
		expect(fingerprint(new Date("2004"))).toBe(new Date("2004").toString());
		expect(fingerprint({ date: new Date("2004") })).toBe(`{"date":${new Date("2004")}}`);
		expect(fingerprint({ symbol: Symbol("abc") })).toBe(`{"symbol":Symbol(abc)}`);

		// Functions.
		expect(fingerprint(function named() {})).toBe(`named()`);
		expect(fingerprint(() => {})).toBe((() => {}).toString());
	});
});
