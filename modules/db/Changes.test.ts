import { Changes, DataUpdate } from "../index.js";

test("Typescript", () => {
	const operations: Changes<{
		collection1: { a: number; one: boolean };
		collection2: { b: number; one: boolean };
		collection3: { c: number; one: boolean };
	}> = {
		"collection1/a1": { a: 1, one: false },
		"collection1/b2": null,
		"collection1/b3": new DataUpdate<{ a: number; one: boolean }>({ one: true }),
		"collection2/a1": { b: 1, one: false },
		"collection2/b2": null,
		"collection2/c3": new DataUpdate<{ b: number; one: boolean }>({ one: true }),
	};
});
