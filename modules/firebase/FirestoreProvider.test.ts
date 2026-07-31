import { describe, expect, test } from "bun:test";
import { ResponseError, UnsupportedError } from "shelving/error";
import { FirestoreProvider } from "shelving/firebase";
import type { Data } from "shelving/util/data";
import { BASICS_COLLECTION, basic999, testDBProvider } from "../test/index.js";

const ROOT = "projects/test/databases/(default)/documents";

type _StubResponse = { readonly status?: number; readonly json: unknown };
type _StubRequest = { readonly url: string; readonly headers: { readonly [key: string]: string }; readonly body: Data };

/** Create a stub `fetch` that records each request and replies with the queued responses in order. */
function _createStub(...responses: _StubResponse[]) {
	const requests: _StubRequest[] = [];
	return {
		requests,
		fetch: (url: string, init: RequestInit): Promise<Response> => {
			requests.push({ url, headers: (init.headers ?? {}) as { [key: string]: string }, body: JSON.parse(String(init.body)) as Data });
			const { status = 200, json } = responses[requests.length - 1] ?? { json: {} };
			return Promise.resolve(new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json" } }));
		},
	};
}

describe("FirestoreProvider (protocol)", () => {
	test("getItem() reads via batchGet and decodes found/missing documents", async () => {
		const stub = _createStub(
			{ json: [{ found: { name: `${ROOT}/basics/basic1`, fields: { str: { stringValue: "aaa" }, num: { integerValue: "100" } } } }] },
			{ json: [{ missing: `${ROOT}/basics/basicNone` }] },
		);
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		expect<unknown>(await provider.getItem(BASICS_COLLECTION, "basic1")).toEqual({ id: "basic1", str: "aaa", num: 100 });
		expect(await provider.getItem(BASICS_COLLECTION, "basicNone")).toBe(undefined);
		expect(stub.requests[0]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:batchGet`);
		expect(stub.requests[0]?.body).toEqual({ documents: [`${ROOT}/basics/basic1`] });
	});

	test("setItem() commits a full update write", async () => {
		const stub = _createStub({ json: {} });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		await provider.setItem(BASICS_COLLECTION, "basic1", { ...basic999, str: "zzz" });
		expect(stub.requests[0]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:commit`);
		const write = (stub.requests[0]!.body.writes as Data[])[0] as Data;
		expect((write.update as Data).name).toBe(`${ROOT}/basics/basic1`);
		expect(((write.update as Data).fields as Data).str).toEqual({ stringValue: "zzz" });
		expect(write.updateMask).toBe(undefined); // No mask means a full overwrite.
	});

	test("updateItem() commits a masked write with transforms and an exists precondition", async () => {
		const stub = _createStub({ json: {} });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW", "+=num": 5, "+[]tags": "extra", "-[]tags": "old" });
		const write = (stub.requests[0]!.body.writes as Data[])[0] as Data;
		expect((write.update as Data).fields).toEqual({ str: { stringValue: "NEW" } });
		expect(write.updateMask).toEqual({ fieldPaths: ["str"] });
		expect(write.updateTransforms).toEqual([
			{ fieldPath: "num", increment: { integerValue: "5" } },
			{ fieldPath: "tags", appendMissingElements: { values: [{ stringValue: "extra" }] } },
			{ fieldPath: "tags", removeAllFromArray: { values: [{ stringValue: "old" }] } },
		]);
		expect(write.currentDocument).toEqual({ exists: true });
	});

	test("addItem() commits a create with a generated 20-character id", async () => {
		const stub = _createStub({ json: {} });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		const id = await provider.addItem(BASICS_COLLECTION, basic999);
		expect(id).toMatch(/^[a-zA-Z0-9]{20}$/);
		const write = (stub.requests[0]!.body.writes as Data[])[0] as Data;
		expect((write.update as Data).name).toBe(`${ROOT}/basics/${id}`);
		expect(write.currentDocument).toEqual({ exists: false });
	});

	test("getQuery() sends a StructuredQuery with filters, orders, and limits", async () => {
		const stub = _createStub({
			json: [
				{ document: { name: `${ROOT}/basics/basic2`, fields: { num: { integerValue: "200" } } } },
				{ document: { name: `${ROOT}/basics/basic1`, fields: { num: { integerValue: "100" } } } },
				{ readTime: "2026-01-01T00:00:00Z" },
			],
		});
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		const items = await provider.getQuery(BASICS_COLLECTION, { group: "a", "num>": 50, $order: "!id", $limit: 5 });
		expect<unknown>(items).toEqual([
			{ id: "basic2", num: 200 },
			{ id: "basic1", num: 100 },
		]);
		expect(stub.requests[0]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:runQuery`);
		expect(stub.requests[0]?.body.structuredQuery).toEqual({
			from: [{ collectionId: "basics" }],
			where: {
				compositeFilter: {
					op: "AND",
					filters: [
						{ fieldFilter: { field: { fieldPath: "group" }, op: "EQUAL", value: { stringValue: "a" } } },
						{ fieldFilter: { field: { fieldPath: "num" }, op: "GREATER_THAN", value: { integerValue: "50" } } },
					],
				},
			},
			orderBy: [{ field: { fieldPath: "__name__" }, direction: "DESCENDING" }],
			limit: 5,
		});
	});

	test("id filters map to __name__ references", async () => {
		const stub = _createStub({ json: [{ readTime: "2026-01-01T00:00:00Z" }] });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		await provider.getQuery(BASICS_COLLECTION, { id: ["basic1", "basic2"] });
		expect(stub.requests[0]?.body.structuredQuery).toMatchObject({
			where: {
				fieldFilter: {
					field: { fieldPath: "__name__" },
					op: "IN",
					value: { arrayValue: { values: [{ referenceValue: `${ROOT}/basics/basic1` }, { referenceValue: `${ROOT}/basics/basic2` }] } },
				},
			},
		});
	});

	test("empty in filters match nothing without a request", async () => {
		const stub = _createStub();
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		expect(await provider.getQuery(BASICS_COLLECTION, { num: [] })).toEqual([]);
		expect(await provider.countQuery(BASICS_COLLECTION, { num: [] })).toBe(0);
		await provider.deleteQuery(BASICS_COLLECTION, { num: [] });
		expect(stub.requests.length).toBe(0);
	});

	test("countQuery() sends an aggregation query and decodes the count", async () => {
		const stub = _createStub({ json: [{ result: { aggregateFields: { count: { integerValue: "9" } } } }] });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		expect(await provider.countQuery(BASICS_COLLECTION, { group: "a" })).toBe(9);
		expect(stub.requests[0]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:runAggregationQuery`);
		expect(stub.requests[0]?.body.structuredAggregationQuery).toMatchObject({ aggregations: [{ alias: "count", count: {} }] });
	});

	test("deleteQuery() reads matching names then commits deletes", async () => {
		const stub = _createStub(
			{ json: [{ document: { name: `${ROOT}/basics/basic1` } }, { document: { name: `${ROOT}/basics/basic2` } }] },
			{ json: {} },
		);
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		await provider.deleteQuery(BASICS_COLLECTION, { group: "a" });
		expect(stub.requests[0]?.body.structuredQuery).toMatchObject({ select: { fields: [{ fieldPath: "__name__" }] } });
		expect(stub.requests[1]?.body.writes).toEqual([{ delete: `${ROOT}/basics/basic1` }, { delete: `${ROOT}/basics/basic2` }]);
	});

	test("sends a bearer token when a token callback is provided", async () => {
		const stub = _createStub({ json: [] });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch, token: () => "TOKEN123" });
		await provider.getItem(BASICS_COLLECTION, "basic1");
		expect(stub.requests[0]?.headers.Authorization).toBe("Bearer TOKEN123");
	});

	test("throws ResponseError with the Google status for failed requests", async () => {
		const stub = _createStub({ status: 400, json: { error: { code: 400, message: "Bad query", status: "INVALID_ARGUMENT" } } });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		try {
			await provider.getQuery(BASICS_COLLECTION, {});
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ResponseError);
			expect((thrown as ResponseError).message).toBe("Bad query");
			expect((thrown as ResponseError).code).toBe(400);
			expect((thrown as ResponseError).status).toBe("INVALID_ARGUMENT");
		}
	});

	test("sequences are not supported", () => {
		const provider = new FirestoreProvider({ project: "test", fetch: _createStub().fetch });
		expect(() => provider.getItemSequence(BASICS_COLLECTION, "basic1")).toThrow(UnsupportedError);
		expect(() => provider.getQuerySequence(BASICS_COLLECTION, {})).toThrow(UnsupportedError);
	});

	test("transact() begins, reads with the transaction id, and commits buffered writes", async () => {
		const stub = _createStub(
			{ json: { transaction: "TX1" } },
			{ json: [{ found: { name: `${ROOT}/basics/basic1`, fields: { num: { integerValue: "1" } } } }] },
			{ json: { commitTime: "2026-01-01T00:00:00Z" } },
		);
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		const result = await provider.transact(async tx => {
			const item = await tx.getItem(BASICS_COLLECTION, "basic1");
			await tx.setItem(BASICS_COLLECTION, "basic1", { ...basic999, num: 2 });
			return item?.num;
		});
		expect(result).toBe(1);
		expect(stub.requests[0]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:beginTransaction`);
		expect(stub.requests[0]?.body).toEqual({ options: { readWrite: {} } });
		expect(stub.requests[1]?.body.transaction).toBe("TX1"); // Reads carry the transaction id.
		expect(stub.requests[2]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:commit`);
		expect(stub.requests[2]?.body.transaction).toBe("TX1");
		expect((stub.requests[2]!.body.writes as Data[]).length).toBe(1); // Writes buffer until commit.
	});

	test("transact() retries with retryTransaction when the commit is aborted", async () => {
		const stub = _createStub(
			{ json: { transaction: "TX1" } },
			{ status: 409, json: { error: { code: 409, message: "Contention", status: "ABORTED" } } },
			{ json: { transaction: "TX2" } },
			{ json: { commitTime: "2026-01-01T00:00:00Z" } },
		);
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		let attempts = 0;
		await provider.transact(async tx => {
			attempts++;
			await tx.setItem(BASICS_COLLECTION, "basic1", { ...basic999, num: attempts });
		});
		expect(attempts).toBe(2); // The whole callback re-runs after contention.
		expect(stub.requests[2]?.body).toEqual({ options: { readWrite: { retryTransaction: "TX1" } } });
		expect(stub.requests[3]?.body.transaction).toBe("TX2");
	});

	test("transact() rolls back and rethrows when the callback throws", async () => {
		const stub = _createStub({ json: { transaction: "TX1" } }, { json: {} });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic1", { ...basic999, num: 1 });
				throw new Error("nope");
			});
			expect.unreachable();
		} catch (thrown) {
			expect((thrown as Error).message).toBe("nope");
		}
		expect(stub.requests[1]?.url).toBe(`https://firestore.googleapis.com/v1/${ROOT}:rollback`);
		expect(stub.requests[1]?.body).toEqual({ transaction: "TX1" });
	});

	test("transact() rejects nested transactions", async () => {
		const stub = _createStub({ json: { transaction: "TX1" } }, { json: {} });
		const provider = new FirestoreProvider({ project: "test", fetch: stub.fetch });
		await provider.transact(async tx => {
			expect(() => tx.transact(async () => undefined)).toThrow(UnsupportedError);
		});
	});
});

// Run the universal DBProvider contract suite (and Firestore-specific integration tests) against the Firestore emulator when one is running.
// Start one with: bun run test-firebase (or `firebase emulators:exec --only firestore --project shelving-test "bun test ./modules/firebase"`).
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
if (EMULATOR_HOST) {
	const createProvider = () => new FirestoreProvider<string, Data>({ project: "shelving-test", host: `http://${EMULATOR_HOST}` });

	testDBProvider("FirestoreProvider", createProvider, { realtime: false, transactions: true });

	test("FirestoreProvider: concurrent transactions retry and preserve every increment", async () => {
		const provider = createProvider();
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
	}, 30000); // Contended transactions wait on emulator locks, so allow extra time.
}
