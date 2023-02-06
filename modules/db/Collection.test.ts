import { AsyncCollection, Collection } from "../index.js";

test("Typescript", () => {
	const syncTyped = undefined as unknown as Collection<{ a: { b: number } }>;
	const syncUntyped: Collection = syncTyped;

	const asyncTyped = undefined as unknown as AsyncCollection<{ a: { b: number } }>;
	const asyncUntyped: AsyncCollection = asyncTyped;
});
