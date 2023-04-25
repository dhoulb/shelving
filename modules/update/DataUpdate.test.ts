import type { Data } from "../index.js";
import { DataUpdate } from "../index.js";

test("DataUpdate", () => {
	const update = new DataUpdate<Data>({ a: 1, b: 2 });
	expect(update.transform()).toEqual({ a: 1, b: 2 });
	expect(update.transform({ b: 2222, c: 3333 })).toEqual({ a: 1, b: 2, c: 3333 });
});
