import { LOADING, Data, Result, Results, Unsubscriber, MutableObject, Observer, isAsync, removeEntry } from "../util";
import { State, Stream } from "../stream";
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

	/** List of subscription streams indexed by path. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #subscriptions: MutableObject<Stream<any>> = {};

	/** The source provider. */
	readonly #source: Provider;

	constructor(source: Provider) {
		this.#source = source;
	}

	/** Get the `State` object for a document. */
	getDocumentState<T extends Data>(ref: Document<T>): State<Result<T>> {
		return this.#getDocumentState<T>(ref.toString());
	}
	#getDocumentState<T extends Data>(key: string): State<Result<T>> {
		return this.#states[key] || this.#createDocumentState<T>(key, LOADING);
	}
	#createDocumentState<T extends Data>(key: string, value: Result<T> | Promise<Result<T>> | typeof LOADING = LOADING): State<Result<T>> {
		return (this.#states[key] = new State(value));
	}
	#gotDocumentState<T extends Data>(key: string, value: Result<T> | Promise<Result<T>>): void {
		const state = this.#states[key];
		if (state && !state.closed) state.next(value);
		else this.#createDocumentState<T>(key, value);
	}

	/**
	 * Get the `State` object for a document and refresh its value if we need to.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds).
	 */
	refreshDocumentState<T extends Data>(ref: Document<T>, maxAge: number | true = 1000): void {
		const key = ref.toString();
		const state = this.getDocumentState<T>(ref);
		if (maxAge === true) {
			// Create a subscription that lasts for 10 seconds.
			if (!this.#subscriptions[key]) setTimeout(this.onDocument(ref, {}), 10000);
		} else {
			// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
			if (!this.#subscriptions[key] && !state.pending && state.age < maxAge) void this.getDocument(ref);
		}
	}

	getDocument<T extends Data>(ref: Document<T>): Result<T> | Promise<Result<T>> {
		const value = this.#source.getDocument(ref);
		this.#gotDocumentState<T>(ref.path, value);
		return value;
	}

	onDocument<T extends Data>(ref: Document<T>, observer: Observer<Result<T>>): Unsubscriber {
		const subscription = this.#getDocumentSubscription(ref);
		subscription.on(observer);
		return () => {
			subscription.off(observer);
			if (subscription.subscribers <= 1) subscription.complete();
		};
	}
	#getDocumentSubscription<T extends Data>(ref: Document<T>): Stream<Result<T>> {
		const path = ref.path;
		const existingSubscription = this.#subscriptions[path];
		if (existingSubscription) return existingSubscription;
		const newSubscription = (this.#subscriptions[path] = new Stream<Result<T>>());
		const cleanup = () => removeEntry(this.#subscriptions, path, newSubscription);
		newSubscription.on({
			next: v => this.#gotDocumentState(path, v),
			error: e => {
				this.#getDocumentState(path).error(e);
				cleanup();
			},
			complete: cleanup,
		});
		this.#source.onDocument(ref, newSubscription);
		return newSubscription;
	}

	addDocument<T extends Data>(ref: Documents<T>, data: T): string | Promise<string> {
		const id = this.#source.addDocument(ref, data);
		const path = ref.path;
		if (isAsync(id)) void id.then(i => this.#gotDocumentState<T>(`${path}/${i}`, data));
		else this.#gotDocumentState<T>(`${path}/${id}`, data);
		return id;
	}

	async setDocument<T extends Data>(ref: Document<T>, data: T): Promise<void> {
		await this.#source.setDocument(ref, data);
		this.#gotDocumentState<T>(ref.toString(), data);
	}

	async updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): Promise<void> {
		await this.#source.updateDocument(ref, partial);
		const state = this.getDocumentState<T>(ref);
		if (!state.loading) state.update(partial);
	}

	async deleteDocument<T extends Data>(ref: Document<T>): Promise<void> {
		await this.#source.deleteDocument(ref);
		this.#gotDocumentState<T>(ref.toString(), undefined);
	}

	/** Get the `State` object for a list of documents. */
	getDocumentsState<T extends Data>(ref: Documents<T>): State<Results<T>> {
		return this.#states[ref.toString()] || this.#createDocumentsState<T>(ref, LOADING);
	}
	#createDocumentsState<T extends Data>(ref: Documents<T>, value: Results<T> | Promise<Results<T>> | typeof LOADING = LOADING): State<Results<T>> {
		const state = (this.#states[ref.toString()] = new State<Results<T>>(value));
		state.on({
			next: v => {
				for (const [id, data] of Object.entries(v)) this.#gotDocumentState<T>(`${ref.path}/${id}`, data);
			},
		});
		return state;
	}
	#gotDocumentsState<T extends Data>(ref: Documents<T>, value: Results<T> | Promise<Results<T>>): void {
		const state = this.getDocumentsState(ref);
		if (state && !state.closed) state.next(value);
		else this.#createDocumentsState(ref, value);
	}

	/**
	 * Get the `State` object for a list of document and refresh its value if we need to.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds
	 */
	refreshDocumentsState<T extends Data>(ref: Documents<T>, maxAge: number | true = 1000): void {
		const key = ref.toString();
		const state = this.getDocumentsState<T>(ref);
		if (maxAge === true) {
			// Create a subscription that lasts for 10 seconds.
			if (!this.#subscriptions[key]) setTimeout(this.onDocuments(ref, {}), 10000);
		} else {
			// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
			if (!this.#subscriptions[key] && !state.pending && state.age < maxAge) void this.getDocuments(ref);
		}
	}

	getDocuments<T extends Data>(ref: Documents<T>): Results<T> | Promise<Results<T>> {
		const value = this.#source.getDocuments(ref);
		this.#gotDocumentsState(ref, value);
		return value;
	}

	onDocuments<T extends Data>(ref: Documents<T>, observer: Observer<Results<T>>): Unsubscriber {
		const subscription = this.#getDocumentsSubscription(ref);
		subscription.on(observer);
		return () => {
			subscription.off(observer);
			if (subscription.subscribers <= 1) subscription.complete();
		};
	}
	#getDocumentsSubscription<T extends Data>(ref: Documents<T>): Stream<Results<T>> {
		const path = ref.path;
		const existingSubscription = this.#subscriptions[path];
		if (existingSubscription) return existingSubscription;
		const newSubscription = (this.#subscriptions[path] = new Stream<Results<T>>());
		const cleanup = () => removeEntry(this.#subscriptions, path, newSubscription);
		newSubscription.on({
			next: v => this.#gotDocumentsState(ref, v),
			error: e => {
				this.getDocumentsState(ref).error(e);
				cleanup();
			},
			complete: cleanup,
		});
		this.#source.onDocuments(ref, newSubscription);
		return newSubscription;
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
