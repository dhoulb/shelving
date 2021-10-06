import { AssertionError } from "../errors";
import { State, StreamClosedError } from "../stream";
import { Data, dispatch, LOADING, MutableObject, Observer, Results, Unsubscriber } from "../util";
import type { Documents } from "./Documents";
import { DocumentState } from "./DocumentState";

/**
 * Documents state: stores the global state of a set of documents.
 * - Documents are uniquely identified by their path and query.
 * - Use a `StateProvider` in your provider chain to update the document state each time a document is retrieved from a source provider.
 */
export class DocumentsState<T extends Data = Data> extends State<Results<T>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static #states: MutableObject<DocumentsState<any>> = {};

	static get<X extends Data>(ref: Documents<X>): DocumentsState<X> {
		const key = ref.toString();
		return (this.#states[key] ||= new DocumentsState(ref));
	}
	static set<X extends Data>(ref: Documents<X>, results: Results<X> | Promise<Results<X>>): void {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.closed) state.next(results);
		else this.#states[key] = new DocumentsState(ref, results);
	}
	static start<X extends Data>(ref: Documents<X>, observer?: Observer<Results<X>>): Unsubscriber {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.closed) return state.start(observer);
		return (this.#states[key] = new DocumentsState(ref)).start(observer);
	}

	/** Reference this state points to. */
	#ref: Documents<T>;

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
	protected constructor(ref: Documents<T>, results: Results<T> | Promise<Results<T>> | typeof LOADING = LOADING) {
		super(results);
		this.#ref = ref;
	}

	/**
	 * Start a realtime subscription from this state to the source provider.
	 * - The realtime subscription will clean itself up when the last observer unsubscribes.
	 */
	start(observer?: Observer<Results<T>>): Unsubscriber {
		if (!this.closed) throw new AssertionError("State must not be closed", this.closed);
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
				// Create a subscription that lasts for 10 seconds.
				setTimeout(this.#ref.subscribe({}), 10000);
			} else {
				// Refresh the data if a fetch isn't already pending, and either `maxAge` is falsy or the existing state is older than `maxAge`
				if (!this.pending && (!maxAge || this.age > maxAge)) this.next(this.#ref.get());
			}
		}
	}

	/**
	 * Get the current value, or refetch the data again if it's outdated.
	 * @param maxAge How old the data can be before it's outdated.
	 * - If `maxAge` is undefined or falsy, always return fresh state.
	 * - If `maxAge` is a number this specifies how old (in milliseconds) the data can be before it's refreshed.
	 * - If `maxAge` is `true` a subscription to the data is started for 10 seconds.
	 */
	get(maxAge = 0): Results<T> | Promise<Results<T>> {
		// Return the current state if its not loading and there's a subscription or the existing state is younger than `maxAge`
		if (!this.loading && (this.#stop || this.age < maxAge)) return this.value;
		// Refresh the state and return the next value after the refresh.
		const next = this.#ref.get();
		this.next(next);
		return next;
	}

	// Override dispatchNext to set the state for every individual document too.
	protected override dispatchNext(results: Results<T>): void {
		super.dispatchNext(results);
		for (const [id, data] of Object.entries(results)) DocumentState.set(this.#ref.doc(id), data);
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
