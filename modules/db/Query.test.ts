import { AsyncQuery, Query } from "../index.js";

test("Typescript", () => {
	const syncTyped = undefined as unknown as Query<{ a: { b: number } }>;
	const syncUntyped: Query = syncTyped;

	const asyncTyped = undefined as unknown as AsyncQuery<{ a: { b: number } }>;
	const asyncUntyped: AsyncQuery = asyncTyped;
});
