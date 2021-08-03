import { State, StreamClosedError } from "../stream";
import { Data, dispatch, LOADING, MutableObject, Observer, Result, Unsubscriber } from "../util";
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
	static update<X extends Data>(ref: Document<X>, data: Partial<X>): void {
		const key = ref.toString();
		const state = this.#states[key];
		if (state && !state.loading && !state.closed) state.update(data);
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
	 * Force refresh this state from the source provider.
	 */
	refresh(): void {
		if (this.closed) throw new StreamClosedError(this);
		this.next(this.#ref.get());
	}

	/**
	 * Conditionally refresh a documents state if it's outdated.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds the data can be before a refresh will be issued).
	 * - If `maxAge` is `true` this will start a realtime subscription to the data that lasts for ten seconds.
	 */
	refreshOutdated(maxAge: number | true): void {
		if (this.closed) throw new StreamClosedError(this);
		// No need to refresh if there's an active subscription.
		if (!this.#stop) {
			if (maxAge === true) {
				// Start a realtime subscription for ten seconds.
				setTimeout(this.start(), 10000);
			} else {
				// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
				if (!this.pending && this.age < maxAge) this.refresh();
			}
		}
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
