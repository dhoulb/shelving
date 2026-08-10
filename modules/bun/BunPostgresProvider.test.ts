import { describe, expect, test } from "bun:test";
import { SQL } from "bun";
import { BunPostgresProvider } from "shelving/bun";
import { UnsupportedError } from "shelving/error";
import type { Data } from "shelving/util/data";
import { BASICS_COLLECTION, basic1, basic2, basic999, testDBProvider } from "../test/index.js";

type _MockQuery = { readonly text: string; readonly values: readonly unknown[]; readonly tx: boolean };
type _MockIdentifier = { readonly identifier: string };
type _MockSQLOptions = { readonly rows?: unknown[][]; readonly failures?: unknown[] };

/** Create a mock `Bun.SQL` object that records queries, replies with queued rows, and implements `begin()` with queued failures. */
function _createMockSQL({ rows = [], failures = [] }: _MockSQLOptions = {}) {
	const queries: _MockQuery[] = [];
	const begins: string[] = [];
	const state = { commits: 0, rollbacks: 0 };
	const make = (tx: boolean) => {
		return (strings: TemplateStringsArray | string, ...values: unknown[]): unknown => {
			if (typeof strings === "string") return { identifier: strings };
			const params: unknown[] = [];
			const text = _render(strings, values, params).replaceAll(/\s+/g, " ").trim();
			queries.push({ text, values: params, tx });
			return Promise.resolve(rows.shift() ?? []);
		};
	};
	const sql = Object.assign(make(false), {
		begin: async (options: string, callback: (tx: unknown) => unknown): Promise<unknown> => {
			begins.push(options);
			const failure = failures.shift();
			if (failure) {
				state.rollbacks++;
				throw failure;
			}
			try {
				const result = await callback(make(true));
				state.commits++;
				return result;
			} catch (thrown) {
				state.rollbacks++;
				throw thrown;
			}
		},
	}) as unknown as SQL;
	return { sql, queries, begins, state };
}

/** Render a flat tagged-template query (values are bindable parameters or mock identifier tokens — `SQLFragment` pre-flattens everything else) into text plus bound params. */
function _render(strings: readonly string[], values: readonly unknown[], params: unknown[]): string {
	let text = strings[0] ?? "";
	for (const [i, value] of values.entries()) {
		if (_isIdentifier(value)) text += `"${value.identifier}"`;
		else {
			params.push(value);
			text += `$${params.length}`;
		}
		text += strings[i + 1] ?? "";
	}
	return text;
}

const _isIdentifier = (value: unknown): value is _MockIdentifier => !!value && typeof value === "object" && "identifier" in value;

/** Create a `SQL.PostgresError` with a given SQLSTATE, as Bun raises for server errors. */
function _createPostgresError(errno: string): SQL.PostgresError {
	return new SQL.PostgresError(`postgres error ${errno}`, { code: "ERR_POSTGRES_SERVER_ERROR", errno });
}

describe("BunPostgresProvider (mock)", () => {
	test("transact() runs the callback's queries on the transaction connection and commits", async () => {
		const mock = _createMockSQL({ rows: [[basic1], []] });
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		const result = await provider.transact(async tx => {
			expect(await tx.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
			await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
			return 123;
		});
		// The callback's value is returned and the transaction began serializable and committed.
		expect(result).toBe(123);
		expect(mock.begins).toEqual(["isolation level serializable"]);
		expect(mock.state).toEqual({ commits: 1, rollbacks: 0 });
		// Every query ran on the transaction connection, not the outer pool.
		expect(mock.queries.length).toBe(2);
		expect(mock.queries.every(q => q.tx)).toBe(true);
		expect(mock.queries[0]!.text).toStartWith(`SELECT * FROM "basics"`);
		expect(mock.queries[1]!.text).toStartWith(`INSERT INTO "basics"`);
	});

	test("transact() rolls back and rethrows when the callback throws", async () => {
		const mock = _createMockSQL();
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic2", basic2);
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(Error);
			expect((thrown as Error).message).toBe("nope");
		}
		// The transaction rolled back and was not retried.
		expect(mock.begins.length).toBe(1);
		expect(mock.state).toEqual({ commits: 0, rollbacks: 1 });
	});

	test("transact() retries serialization failures and deadlocks then succeeds", async () => {
		const mock = _createMockSQL({ failures: [_createPostgresError("40001"), _createPostgresError("40P01")] });
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		expect(await provider.transact(async () => 123)).toBe(123);
		expect(mock.begins.length).toBe(3);
		expect(mock.state).toEqual({ commits: 1, rollbacks: 2 });
	});

	test("transact() throws the final contention error after exhausting retries", async () => {
		const failure = _createPostgresError("40001");
		const mock = _createMockSQL({ failures: [failure, failure, failure, failure, failure] });
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		try {
			await provider.transact(async () => 123);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBe(failure);
		}
		expect(mock.begins.length).toBe(5);
	}, 10000); // Backoff delays add up across five attempts.

	test("transact() rethrows non-retryable errors immediately", async () => {
		const failure = _createPostgresError("23505"); // Unique violation is not contention.
		const mock = _createMockSQL({ failures: [failure] });
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		try {
			await provider.transact(async () => 123);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBe(failure);
		}
		expect(mock.begins.length).toBe(1);
	});

	test("transact() rejects nested transactions", async () => {
		const mock = _createMockSQL();
		const provider = new BunPostgresProvider<string, Data>(mock.sql);
		await provider.transact(async tx => {
			expect(() => tx.transact(async () => undefined)).toThrow(UnsupportedError);
		});
	});
});

// Run the universal DBProvider contract suite (and Postgres-specific integration tests) against a real PostgreSQL when one is available.
// Run via: bun run postgres — scripts/postgres.ts provisions the test database and fixture tables, runs this file with POSTGRES_URL set, then tears down.
const POSTGRES_URL = process.env.POSTGRES_URL;
if (POSTGRES_URL) {
	const sql = new SQL(POSTGRES_URL);
	const provider = new BunPostgresProvider<string, Data>(sql);
	const createProvider = () => provider;

	testDBProvider("BunPostgresProvider", createProvider, { realtime: false, transactions: true });

	test("BunPostgresProvider: concurrent transactions retry and preserve every increment", async () => {
		await createProvider();
		await provider.deleteQuery(BASICS_COLLECTION, {});
		await provider.setItem(BASICS_COLLECTION, "counter", { ...basic999, num: 0 });
		await Promise.all(
			Array.from({ length: 3 }, () =>
				provider.transact(async tx => {
					const { id: _id, ...data } = await tx.requireItem(BASICS_COLLECTION, "counter");
					await tx.setItem(BASICS_COLLECTION, "counter", { ...data, num: (data.num as number) + 1 });
				}),
			),
		);
		expect((await provider.requireItem(BASICS_COLLECTION, "counter")).num).toBe(3);
	}, 30000); // Contended serializable transactions back off between retries, so allow extra time.
}
