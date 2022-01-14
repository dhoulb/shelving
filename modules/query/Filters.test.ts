import { Filter, Filters } from "../index.js";

test("Typescript", () => {
	const filter1: Filters<{ a: number }> = new Filters<{ a: number }>();
});
test("Filters.on()", () => {
	expect(Filters.on<{ a: number; b: number }>({ "a": 1, "!b": 1 })).toEqual(new Filters(new Filter("a", "IS", 1), new Filter("b", "NOT", 1)));
	expect(Filters.on<{ c: number[] }>({ "c[]": 1 })).toEqual(new Filters(new Filter("c", "CONTAINS", 1)));
	expect(Filters.on<{ a: number; b: number; c: number; d: number }>({ "a>": 1, "b>=": 1, "c<": 1, "d<=": 1 })).toEqual(new Filters(new Filter("a", "GT", 1), new Filter("b", "GTE", 1), new Filter("c", "LT", 1), new Filter("d", "LTE", 1)));
	expect(Filters.on<{ a: number; b: number }>({ "a": [1], "!b": [1] })).toEqual(new Filters(new Filter("a", "IN", [1]), new Filter("b", "OUT", [1])));
});
