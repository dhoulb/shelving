import { State, StreamClosedError } from "../stream";
import { Data, dispatch, LOADING, MutableObject, Observer, Result, Transforms, Unsubscriber } from "../util";
import type { Document } from "./Document";

/**
 * Document state: stores the global state of a specific document.
 * - Documents are uniquely identified by their path and ID.
 * - Use a `StateProvider` in your provider chain to update the document state each time a document is retrieved from a source provider.
 */
export class DocumentState<T extends Data = Data> extends State<Result<T>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static #states: MutableObject<DocumentState<any>> = {};

	static get<X extends Data>(ref: Document<X>): DocumentState<X> {
		const key = ref.toString();
		return (this.#states[key] ||= new DocumentState<X>(ref));
	}
	static set<X extends Data>(ref: Document<X>, result: Result<X> | Promise<Result<X>>): void {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.closed) state.next(result);
		else this.#states[key] = new DocumentState(ref, result);
	}
	static update<X extends Data>(ref: Document<X>, transforms: Transforms<X>): void {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.loading && !state.closed) state.update(transforms);
	}
	static start<X extends Data>(ref: Document<X>, observer?: Observer<Result<X>>): Unsubscriber {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.closed) return state.start(observer);
		return (this.#states[key] = new DocumentState(ref)).start(observer);
	}

	/** Reference this state points to. */
	#ref: Document<T>;

	/**
	 * Number of observers that require this state to have a realtime subscription to its source.
	 * - The realtime subscription can be cleaned up if all realtime subscribers end.
	 */
	#realtime = 0;

	/** The unsubscriber function to call to end any current realtime subscription this state has to its source. */
	#stop: Unsubscriber | undefined = undefined;

	/** Whether we currently have an active realtime subscription, or not. */
	get started(): boolean {
		return !!this.#stop;
	}

	// Protected (access through static `get()` etc instead).
	protected constructor(ref: Document<T>, value: Result<T> | Promise<Result<T>> | typeof LOADING = LOADING) {
		super(value);
		this.#ref = ref;
	}

	/**
	 * Start a realtime subscription from this state to the source provider.
	 * - The realtime subscription will clean itself up when the last observer unsubscribes.
	 */
	start(observer?: Observer<Result<T>>): Unsubscriber {
		if (this.closed) throw new StreamClosedError(this);
		this.#realtime++;
		if (!this.#stop) this.#stop = this.#ref.subscribe(this);
		if (observer) this.on(observer);
		return () => {
			this.#realtime--;
			if (this.#realtime <= 0) this.stop();
			if (observer) this.off(observer);
		};
	}

	/**
	 * Stop any realtime subscription.
	 * - Stops regardless of whether anything is using the subscription!
	 */
	stop(): void {
		if (this.#stop) this.#stop = void dispatch(this.#stop);
	}

	/**
	 * Refresh the state.
	 * @param maxAge How old the data can be before it's outdated.
	 * - If `maxAge` is undefined or falsy, always refresh the state.
	 * - If `maxAge` is a number this specifies how old (in milliseconds) the data can be before it's refreshed.
	 * - If `maxAge` is `true` a subscription to the data is started for 10 seconds.
	 */
	refresh(maxAge?: number | true): void {
		if (this.closed) throw new StreamClosedError(this);
		// No need to refresh if there's an active subscription.
		if (!this.#stop) {
			if (maxAge === true) {
				// Start a realtime subscription for ten seconds.
				setTimeout(this.start(), 10000);
			} else {
				// Refresh the data if a fetch isn't already pending, and either `maxAge` is falsy or the existing state is older than `maxAge`
				if (!this.pending && (!maxAge || this.age > maxAge)) this.next(this.#ref.get());
			}
		}
	}

	/**
	 * Get the current value, or refetch the data again if it's outdated.
	 * @param maxAge How old the data can be before it's outdated.
	 * - If `maxAge` is a number this specifies how old (in milliseconds) the data can be before it's refreshed.
	 * - If `maxAge` is `true` a subscription to the data is started for 10 seconds.
	 */
	get(maxAge = 0): Result<T> | Promise<Result<T>> {
		// Return the current state if its not loading and there's a subscription or the existing state is younger than `maxAge`
		if (!this.loading && (this.#stop || this.age < maxAge)) return this.value;
		// Refresh the state and return the next value after the refresh.
		const next = this.#ref.get();
		this.next(next);
		return next;
	}

	// Override to stop any realtime subscription on error or complete.
	protected override dispatchError(reason: Error | unknown): void {
		this.stop();
		super.dispatchError(reason);
	}
	protected override dispatchComplete(): void {
		this.stop();
		super.dispatchComplete();
	}
}
