import { AsyncItem, Item } from "../index.js";

test("Typescript", () => {
	const syncTyped = undefined as unknown as Item<{ a: { b: number } }, "a">;
	const syncUntyped: Item = syncTyped;

	const asyncTyped = undefined as unknown as AsyncItem<{ a: { b: number } }, "a">;
	const asyncUntyped: AsyncItem = asyncTyped;
});
