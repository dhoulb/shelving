import { AssertionError } from "../errors";
import { State } from "../stream";
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
	 * Force refresh this state from the source provider.
	 */
	refresh(): void {
		this.next(this.#ref.get());
	}

	/**
	 * Conditionally refresh a documents state if it's outdated.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds
	 */
	refreshOutdated(maxAge: number | true): void {
		// No need to refresh if there's an active subscription.
		if (!this.#stop) {
			if (maxAge === true) {
				// Create a subscription that lasts for 10 seconds.
				setTimeout(this.#ref.subscribe({}), 10000);
			} else {
				// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
				if (!this.pending && this.age < maxAge) this.refresh();
			}
		}
	}

	// Override dispatchNext to set the state for every individual document too.
	protected dispatchNext(results: Results<T>): void {
		super.dispatchNext(results);
		for (const [id, data] of Object.entries(results)) DocumentState.set(this.#ref.doc(id), data);
	}

	// Override to stop any realtime subscription on error or complete.
	protected dispatchError(reason: Error | unknown): void {
		this.stop();
		super.dispatchError(reason);
	}
	protected dispatchComplete(): void {
		this.stop();
		super.dispatchComplete();
	}
}
