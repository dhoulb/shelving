import { AsyncItem, Item } from "../index.js";

test("Typescript", () => {
	const syncTyped: Item<{ a: { b: number } }, "a"> = undefined as any;
	const syncUntyped: Item = syncTyped;

	const asyncTyped: AsyncItem<{ a: { b: number } }, "a"> = undefined as any;
	const asyncUntyped: AsyncItem = asyncTyped;
});
