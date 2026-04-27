import { describe, expect, test } from "bun:test";
import { DATA, EndpointStore, GET, getDeferred, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";
import { EXPECT_PROMISELIKE } from "../../test/index.js";

describe("EndpointStore", () => {
	test("starts loading and resolves after reading loading", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider(() => deferred.promise);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		// No fetch has started yet — reading loading triggers it.
		expect(store.loading).toBe(true);
		try {
			store.value;
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
		}

		deferred.resolve(Response.json("ready"));
		await runMicrotasks();

		expect(store.loading).toBe(false);
		expect(store.value).toBe("ready");
		expect(provider.fetchCalls).toHaveLength(1);
	});

	test("refresh() reuses the current in-flight request", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider(() => deferred.promise);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		const first = store.refresh();
		const second = store.refresh();
		expect(first).toBe(second);

		deferred.resolve(Response.json("done"));
		await first;

		expect(store.value).toBe("done");
		expect(provider.fetchCalls).toHaveLength(1);
	});

	test("changing payload aborts the old request and fetches with the new payload", async () => {
		const requests: Request[] = [];
		const provider = new MockAPIProvider(request => {
			requests.push(request);
			if (request.url.endsWith("/users/123"))
				return new Promise<Response>((_resolve, reject) => request.signal.addEventListener("abort", () => reject(request.signal.reason)));
			return Promise.resolve(Response.json("value:456"));
		});
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		// Trigger the first fetch (for "123").
		store.loading;
		await runMicrotasks();
		expect(requests).toHaveLength(1);

		// Change payload — invalidate() aborts "123" (clears _inflight), then refresh()
		// immediately starts "456" since _inflight is now clear.
		store.payload.value = { id: "456" };
		await runMicrotasks(); // "123" abort fires (discarded), "456" resolves and is applied.

		expect(requests).toHaveLength(2);
		expect(requests[0]?.signal.aborted).toBe(true);
		expect(provider.fetchCalls).toHaveLength(1);
		expect(store.value).toBe("value:456");
	});

	test("invalidate() marks the store stale; the next loading read re-fetches", async () => {
		let count = 0;
		const provider = new MockAPIProvider(async () => Response.json(`value:${++count}`));
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		// First fetch.
		store.loading;
		await runMicrotasks();
		expect(store.value).toBe("value:1");

		// Invalidate — old value is kept, store is marked stale.
		store.invalidate();
		expect(store.value).toBe("value:1"); // value preserved
		expect(store.loading).toBe(false); // loading is false (value exists)

		// Reading loading with _invalid=true triggers a background re-fetch.
		await runMicrotasks();
		expect(store.value).toBe("value:2");
	});

	test("stores thrown reasons from failed fetches", async () => {
		const reason = new Error("Nope");
		class FailingAPIProvider extends MockAPIProvider {
			override call(): Promise<never> {
				return Promise.reject(reason);
			}
		}

		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const error = console.error;

		try {
			console.error = () => undefined;
			const store = new EndpointStore(endpoint, { id: "123" }, new FailingAPIProvider());

			// Trigger the fetch.
			store.loading;
			await runMicrotasks();

			expect(store.reason).toBe(reason);
			expect(() => store.value).toThrow("Nope");
		} finally {
			console.error = error;
		}
	});
});
