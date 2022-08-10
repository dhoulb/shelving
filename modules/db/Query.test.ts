import { AsyncQuery, Query } from "../index.js";

test("Typescript", () => {
	const syncTyped: Query<{ a: { b: number } }> = undefined as any;
	const syncUntyped: Query = syncTyped;

	const asyncTyped: AsyncQuery<{ a: { b: number } }> = undefined as any;
	const asyncUntyped: AsyncQuery = asyncTyped;
});
