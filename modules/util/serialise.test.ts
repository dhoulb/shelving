import { serialise } from "../index.js";

describe("serialise()", () => {
	test("Works correctly", () => {
		// Primitives.
		expect(serialise(true)).toBe("true");
		expect(serialise(false)).toBe("false");
		expect(serialise(null)).toBe("null");
		expect(serialise(undefined)).toBe(`{"$type":"undefined"}`);
		expect(serialise(123)).toBe("123");
		expect(serialise(123.456)).toBe("123.456");
		expect(serialise("abc")).toBe(`"abc"`);
		expect(serialise(`a"b"c`)).toBe(`"a\\"b\\"c"`);

		// Symbols.
		expect(serialise(Symbol("abc"))).toBe(`{"$type":"symbol","description":"abc"}`);
		expect(serialise(Symbol())).toBe(`{"$type":"symbol"}`);

		// Functions.
		expect(serialise(function aaaa() {})).toBe(`{"$type":"function","name":"aaaa"}`);
		expect(serialise(() => {})).toBe(`{"$type":"function"}`);

		// Arrays.
		expect(serialise([1, 2, 3])).toBe("[1,2,3]");
		expect(serialise([Symbol("abc"), function bbbb() {}])).toBe(`[{"$type":"symbol","description":"abc"},{"$type":"function","name":"bbbb"}]`);

		// Objects.
		expect(serialise({ a: 1, b: 2 })).toBe(`{"a":1,"b":2}`);
		expect(serialise({ symbol: Symbol("abc") })).toBe(`{"symbol":{"$type":"symbol","description":"abc"}}`);

		// Object keys are escaped.
		expect(serialise({ [`a"b"c`]: 1 })).toBe(`{"a\\"b\\"c":1}`);

		// Object keys are sorted.
		expect(serialise({ c: 3, b: 2, a: 1 })).toBe(`{"a":1,"b":2,"c":3}`);

		// Objects with custom toString() use it.
		expect(serialise(new Date("2004"))).toBe(`{"$type":"Date","value":"${new Date("2004").toString()}"}`);
	});
});
