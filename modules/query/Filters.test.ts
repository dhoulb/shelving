import { Filter, Filters } from "../index.js";

test("Typescript", () => {
	const filter1: Filters<{ a: number }> = new Filters<{ a: number }>();
});
test("new Filters()", () => {
	expect(new Filters<{ a: number; b: number }>({ "a": 1, "!b": 1 })).toEqual(new Filters(new Filter("a", 1), new Filter("!b", 1)));
	expect(new Filters<{ c: number[] }>({ "c[]": 1 })).toEqual(new Filters(new Filter("c[]", 1)));
	expect(new Filters<{ a: number; b: number; c: number; d: number }>({ "a>": 1, "b>=": 1, "c<": 1, "d<=": 1 })).toEqual(new Filters(new Filter("a>", 1), new Filter("b>=", 1), new Filter("c<", 1), new Filter("d<=", 1)));
	expect(new Filters<{ a: number; b: number }>({ "a": [1], "!b": [1] })).toEqual(new Filters(new Filter("a", [1]), new Filter("!b", [1])));
});
test(".filter()", () => {
	expect(new Filters<{ a: number; b: number }>().filter({ "a": 1, "!b": 1 })).toEqual(new Filters(new Filter("a", 1), new Filter("!b", 1)));
	expect(new Filters<{ c: number[] }>().filter({ "c[]": 1 })).toEqual(new Filters(new Filter("c[]", 1)));
	expect(new Filters<{ a: number; b: number; c: number; d: number }>().filter({ "a>": 1, "b>=": 1, "c<": 1, "d<=": 1 })).toEqual(new Filters(new Filter("a>", 1), new Filter("b>=", 1), new Filter("c<", 1), new Filter("d<=", 1)));
	expect(new Filters<{ a: number; b: number }>().filter({ "a": [1], "!b": [1] })).toEqual(new Filters(new Filter("a", [1]), new Filter("!b", [1])));
});
