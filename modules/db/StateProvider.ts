import { LOADING } from "../constants";
import type { Data, Result, Results } from "../data";
import { dispatch, Unsubscriber } from "../function";
import { MutableObject, removeEntry } from "../object";
import { State, Observer, Stream } from "../stream";
import type { Document } from "./Document";
import type { Documents } from "./Documents";
import type { Provider } from "./Provider";

/**
 * State provider: keeps track of, and provides access to, the most recent value for a source provider.
 */
export class StateProvider implements Provider {
	/** List of states indexed by path. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #states: MutableObject<State<any>> = {};

	/** Subscription streams — these are passed to the source provider to receive live values. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #subscriptions: MutableObject<Stream<any>> = {};

	/** The source provider. */
	readonly #source: Provider;

	constructor(source: Provider) {
		this.#source = source;
	}

	currentDocument<T extends Data>(ref: Document<T>): State<Result<T>> {
		return this.#documentState(ref.path);
	}
	#documentState<T extends Data>(path: string): State<Result<T>> {
		return (this.#states[path] ||= new State<T>(LOADING));
	}

	getDocument<T extends Data>(ref: Document<T>): Result<T> | Promise<Result<T>> {
		const result = this.#source.getDocument(ref);
		void this.#gotResult(ref.path, result);
		return result;
	}
	async #gotResult<T extends Data>(path: string, asyncResult: Result<T> | Promise<Result<T>>): Promise<void> {
		const result = await asyncResult;
		this.#documentState<T>(path).next(result);
	}

	onDocument<T extends Data>(ref: Document<T>, observer: Observer<Result<T>>): Unsubscriber {
		const sub: Stream<Result<T>> = this.#subscriptions[ref.path] || this.#createDocumentSubscription<T>(ref);

		// Add the observer.
		const stop = sub.subscribe(observer);

		return () => {
			// Remove the observer.
			dispatch(stop);

			// Complete the subscription (if that was the last observer).
			// The `<=1` accounts for the utility observer.
			if (sub.subscribers <= 1) sub.complete();
		};
	}
	#createDocumentSubscription<T extends Data>(ref: Document<T>): Stream<Result<T>> {
		const path = ref.path;

		// Create a new `Stream` instance that get passed into the source to hold the subscription.
		const sub = (this.#subscriptions[path] = new Stream<Result<T>>());

		// Subscribe `sub` to the source provider.
		const stop = this.#source.onDocument(ref, sub);

		// When the sub completes or errors, remove it from the subscriptions list.
		// This means the next time `onDocument()` is called, a new subscription will be created.
		const cleanup = () => {
			dispatch(stop);
			removeEntry(this.#subscriptions, path, sub);
		};

		// The stream always has a utility observer that passses next values to the state and does cleanup.
		sub.on({
			next: v => this.#gotResult(path, v),
			complete: cleanup,
			error: cleanup,
		});
		return sub;
	}

	addDocument<T extends Data>(ref: Documents<T>, data: T): string | Promise<string> {
		const path = ref.path;
		const id = this.#source.addDocument(ref, data);
		if (id instanceof Promise) void id.then(k => this.#documentState<T>(`${path}/${k}`).next(data));
		else this.#documentState<T>(`${path}/${id}`).next(data);
		return id;
	}

	async setDocument<T extends Data>(ref: Document<T>, data: T): Promise<void> {
		await this.#source.setDocument(ref, data);
		this.#documentState<T>(ref.path).next(data);
	}

	async updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): Promise<void> {
		await this.#source.updateDocument(ref, partial);
		const state = this.#documentState<T>(ref.path);
		if (!state.loading) state.update(partial);
	}

	async deleteDocument<T extends Data>(ref: Document<T>): Promise<void> {
		await this.#source.deleteDocument(ref);
		this.#documentState<T>(ref.path).next(undefined);
	}

	currentDocuments<T extends Data>(ref: Documents<T>): State<Results<T>> {
		return this.#documentsState(ref.path);
	}
	#documentsState<T extends Data>(path: string): State<Results<T>> {
		return (this.#states[path] ||= new State(LOADING));
	}

	getDocuments<T extends Data>(ref: Documents<T>): Results<T> | Promise<Results<T>> {
		const results = this.#source.getDocuments(ref);
		void this.#gotResults(ref.path, results);
		return results;
	}
	async #gotResults<T extends Data>(path: string, asyncResults: Results<T> | Promise<Results<T>>): Promise<void> {
		const results = await asyncResults;
		// Update the documents (list) state.
		this.#documentsState(path).next(results);
		// Update each individual document state.
		for (const [id, data] of Object.entries(results)) this.#documentState<T>(`${path}/${id}`).next(data);
	}

	onDocuments<T extends Data>(ref: Documents<T>, observer: Observer<Results<T>>): Unsubscriber {
		const sub: Stream<Results<T>> = this.#subscriptions[ref.path] || this.#createDocumentsSubscription<T>(ref);

		// Add the observer.
		const stop = sub.subscribe(observer);

		return () => {
			// Remove the observer.
			dispatch(stop);

			// Complete the subscription (if that was the last observer).
			// The `<=1` accounts for the utility observer.
			if (sub.subscribers <= 1) sub.complete();
		};
	}
	#createDocumentsSubscription<T extends Data>(ref: Documents<T>): Stream<Results<T>> {
		const path = ref.path;

		// Create a new `Stream` instance that get passed into the source to hold the subscription.
		const sub = (this.#subscriptions[path] = new Stream<Results<T>>());

		// Subscribe `sub` to the source provider.
		const stop = this.#source.onDocuments(ref, sub);

		// When the sub completes or errors, remove it from the subscriptions list.
		// This means the next time `onDocuments()` is called, a new subscription will be created.
		const cleanup = () => {
			dispatch(stop);
			removeEntry(this.#subscriptions, path, sub);
		};

		// The stream always has a utility observer that passses next values to the state and does cleanup.
		sub.on({
			next: v => this.#gotResults(path, v),
			complete: cleanup,
			error: cleanup,
		});
		return sub;
	}

	setDocuments<T extends Data>(ref: Documents<T>, data: T): void | Promise<void> {
		return this.#source.setDocuments(ref, data);
	}

	updateDocuments<T extends Data>(ref: Documents<T>, partial: Partial<T>): void | Promise<void> {
		return this.#source.updateDocuments(ref, partial);
	}

	deleteDocuments<T extends Data>(ref: Documents<T>): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}
