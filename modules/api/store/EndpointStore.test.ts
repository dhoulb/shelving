import { describe, expect, test } from "bun:test";
import { DATA, EndpointStore, GET, getDeferred, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";
import { EXPECT_PROMISELIKE } from "../../test/index.js";

describe("EndpointStore", () => {
	test("starts fetching immediately and resolves its value", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider(() => deferred.promise);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

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
		expect(provider.calls).toHaveLength(1);
	});

	test("fetch() reuses the current in-flight request", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider(() => deferred.promise);
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		const first = store.fetch();
		const second = store.fetch();
		expect(first).toBe(second);

		deferred.resolve(Response.json("done"));
		await first;

		expect(store.value).toBe("done");
		expect(provider.calls).toHaveLength(1);
	});

	test("changing payload aborts the old request and fetches the new payload", async () => {
		const requests: Request[] = [];
		const provider = new MockAPIProvider(request => {
			requests.push(request);
			if (request.url.endsWith("/users/123"))
				return new Promise<Response>((_resolve, reject) => request.signal.addEventListener("abort", () => reject(request.signal.reason)));
			return Promise.resolve(Response.json("value:456"));
		});
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);
		const error = console.error;

		try {
			console.error = () => undefined;
			store.payload = { id: "456" };
			await runMicrotasks();
		} finally {
			console.error = error;
		}

		expect(requests).toHaveLength(2);
		expect(requests[0]?.signal.aborted).toBe(true);
		expect(provider.calls).toHaveLength(1);
		expect(store.value).toBe("value:456");
	});

	test("invalidate() clears the current value and refetches on the next read", async () => {
		let count = 0;
		const provider = new MockAPIProvider(async () => Response.json(`value:${++count}`));
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		await runMicrotasks();
		expect(store.value).toBe("value:1");

		store.invalidate();
		expect(store.loading).toBe(true);

		try {
			store.value;
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
		}

		await runMicrotasks();
		expect(store.value).toBe("value:2");
	});

	test("stores thrown reasons from failed fetches", async () => {
		const reason = new Error("Nope");
		class FailingAPIProvider extends MockAPIProvider {
			override fetch(): Promise<never> {
				return Promise.reject(reason);
			}
		}

		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const error = console.error;

		try {
			console.error = () => undefined;
			const store = new EndpointStore(endpoint, { id: "123" }, new FailingAPIProvider());
			await runMicrotasks();
			expect(store.reason).toBe(reason);
			expect(() => store.value).toThrow("Nope");
		} finally {
			console.error = error;
		}
	});
});
