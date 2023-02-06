import { AsyncDatabase, Database } from "../index.js";

test("Typescript", () => {
	const syncTyped = undefined as unknown as Database<{ a: { b: number } }>;
	const syncUntyped: Database = syncTyped;

	const asyncTyped = undefined as unknown as AsyncDatabase<{ a: { b: number } }>;
	const asyncUntyped: AsyncDatabase = asyncTyped;
});
