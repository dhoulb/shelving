import { describe, expect, test } from "bun:test";
import { APIProvider, DATA, EndpointStore, GET, getDeferred, MockAPIProvider, runMicrotasks, STRING } from "../../index.js";
import { EXPECT_PROMISELIKE } from "../../test/index.js";

describe("EndpointStore", () => {
	test("starts fetching immediately and resolves its value", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: () => deferred.promise,
		});
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		expect(store.loading).toBe(true);
		try {
			store.value;
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toMatchObject(EXPECT_PROMISELIKE);
		}

		deferred.resolve(
			new Response(JSON.stringify("ready"), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		await runMicrotasks();

		expect(store.loading).toBe(false);
		expect(store.value).toBe("ready");
		expect(provider.calls).toHaveLength(1);
	});

	test("fetch() reuses the current in-flight request", async () => {
		const deferred = getDeferred<Response>();
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: () => deferred.promise,
		});
		const endpoint = GET("/users/{id}", DATA({ id: STRING }), STRING);
		const store = new EndpointStore(endpoint, { id: "123" }, provider);

		const first = store.fetch();
		const second = store.fetch();
		expect(first).toBe(second);

		deferred.resolve(
			new Response(JSON.stringify("done"), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		await first;

		expect(store.value).toBe("done");
		expect(provider.calls).toHaveLength(1);
	});

	test("changing payload aborts the old request and fetches the new payload", async () => {
		class SlowAPIProvider extends APIProvider {
			readonly calls: Array<{ payload: unknown; signal: AbortSignal | undefined }> = [];

			override fetch<P extends { id: string }, R>(_endpoint: never, payload: P, options?: RequestInit): Promise<R> {
				this.calls.push({ payload, signal: options?.signal });
				if (payload.id === "123")
					return new Promise<R>((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(options.signal?.reason)));
				return Promise.resolve(`value:${payload.id}` as R);
			}
		}

		const provider = new SlowAPIProvider();
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

		expect(provider.calls).toHaveLength(2);
		expect(provider.calls[0]?.signal?.aborted).toBe(true);
		expect(store.value).toBe("value:456");
	});

	test("invalidate() clears the current value and refetches on the next read", async () => {
		let count = 0;
		const provider = new MockAPIProvider({
			url: "https://api.example.com/",
			handler: async () =>
				new Response(JSON.stringify(`value:${++count}`), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		});
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
		class FailingAPIProvider extends APIProvider {
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
