import { DELETE, DictionaryUpdate } from "../index.js";

test("DictionaryUpdate", () => {
	const update = new DictionaryUpdate<number>({ a: 1, b: 2, z: DELETE });
	expect(update.transform()).toEqual({ a: 1, b: 2 });
	expect(update.transform({ b: 2222, c: 3333 })).toEqual({ a: 1, b: 2, c: 3333 });
	expect(update.transform({ b: 2222, z: 9 })).toEqual({ a: 1, b: 2 });
});
