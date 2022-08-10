import { FilterConstraint, FilterConstraints } from "../index.js";

test("Typescript", () => {
	const filter1: FilterConstraints<{ a: number }> = new FilterConstraints<{ a: number }>();
});
test("construct", () => {
	expect(new FilterConstraints<{ a: number; b: number }>({ "a": 1, "!b": 1 })).toEqual(new FilterConstraints(new FilterConstraint("a", 1), new FilterConstraint("!b", 1)));
	expect(new FilterConstraints<{ c: number[] }>({ "c[]": 1 })).toEqual(new FilterConstraints(new FilterConstraint("c[]", 1)));
	expect(new FilterConstraints<{ a: number; b: number; c: number; d: number }>({ "a>": 1, "b>=": 1, "c<": 1, "d<=": 1 })).toEqual(
		new FilterConstraints(new FilterConstraint("a>", 1), new FilterConstraint("b>=", 1), new FilterConstraint("c<", 1), new FilterConstraint("d<=", 1)),
	);
	expect(new FilterConstraints<{ a: number; b: number }>({ "a": [1], "!b": [1] })).toEqual(new FilterConstraints(new FilterConstraint("a", [1]), new FilterConstraint("!b", [1])));
});
test(".filter()", () => {
	expect(new FilterConstraints<{ a: number; b: number }>().filter({ "a": 1, "!b": 1 })).toEqual(new FilterConstraints(new FilterConstraint("a", 1), new FilterConstraint("!b", 1)));
	expect(new FilterConstraints<{ c: number[] }>().filter({ "c[]": 1 })).toEqual(new FilterConstraints(new FilterConstraint("c[]", 1)));
	expect(new FilterConstraints<{ a: number; b: number; c: number; d: number }>().filter({ "a>": 1, "b>=": 1, "c<": 1, "d<=": 1 })).toEqual(
		new FilterConstraints(new FilterConstraint("a>", 1), new FilterConstraint("b>=", 1), new FilterConstraint("c<", 1), new FilterConstraint("d<=", 1)),
	);
	expect(new FilterConstraints<{ a: number; b: number }>().filter({ "a": [1], "!b": [1] })).toEqual(new FilterConstraints(new FilterConstraint("a", [1]), new FilterConstraint("!b", [1])));
});
