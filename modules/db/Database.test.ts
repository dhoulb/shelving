import { AsyncDatabase, Database } from "../index.js";

test("Typescript", () => {
	const syncTyped: Database<{ a: { b: number } }> = undefined as any;
	const syncUntyped: Database = syncTyped;

	const asyncTyped: AsyncDatabase<{ a: { b: number } }> = undefined as any;
	const asyncUntyped: AsyncDatabase = asyncTyped;
});
