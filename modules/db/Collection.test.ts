import { AsyncCollection, Collection } from "../index.js";

test("Typescript", () => {
	const syncTyped: Collection<{ a: { b: number } }> = undefined as any;
	const syncUntyped: Collection = syncTyped;

	const asyncTyped: AsyncCollection<{ a: { b: number } }> = undefined as any;
	const asyncUntyped: AsyncCollection = asyncTyped;
});
