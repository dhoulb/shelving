import { LOADING, Data, Result, Results, Unsubscriber, MutableObject, Observer, removeEntry } from "../util";
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
	getDocumentState(ref: Document): State<Result> {
		return this.#getDocumentState(ref.toString());
	}
	#getDocumentState(key: string): State<Result> {
		return this.#states[key] || this.#createDocumentState(key, LOADING);
	}
	#createDocumentState(key: string, value: Result | Promise<Result> | typeof LOADING = LOADING): State<Result> {
		return (this.#states[key] = new State(value));
	}
	/** Got a value we know _for sure_ should be the exact value of the state. */
	#gotDocumentState(key: string, value: Result | Promise<Result>): void {
		const state = this.#states[key];
		if (state && !state.closed) state.next(value);
		else this.#createDocumentState(key, value);
	}
	/** Update an existing state with new partial value (but only if the state already exists as it might be partial). */
	#updateDocumentState(key: string, data: Partial<Data>): void {
		const state = this.#states[key];
		if (state && !state.loading && !state.closed) state.update(data);
	}

	/**
	 * Get the `State` object for a document and refresh its value if we need to.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds).
	 */
	refreshDocumentState(ref: Document, maxAge: number | true = 1000): void {
		const key = ref.toString();
		const state = this.getDocumentState(ref);
		if (maxAge === true) {
			// Create a subscription that lasts for 10 seconds.
			if (!this.#subscriptions[key]) setTimeout(this.onDocument(ref, {}), 10000);
		} else {
			// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
			if (!this.#subscriptions[key] && !state.pending && state.age < maxAge) void this.getDocument(ref);
		}
	}

	getDocument(ref: Document): Result | Promise<Result> {
		const value = this.#source.getDocument(ref);
		this.#gotDocumentState(ref.path, value);
		return value;
	}

	onDocument(ref: Document, observer: Observer<Result>): Unsubscriber {
		const subscription = this.#getDocumentSubscription(ref);
		subscription.on(observer);
		return () => {
			subscription.off(observer);
			if (subscription.subscribers <= 1) subscription.complete();
		};
	}
	#getDocumentSubscription(ref: Document): Stream<Result> {
		const path = ref.path;
		const existingSubscription = this.#subscriptions[path];
		if (existingSubscription) return existingSubscription;
		const newSubscription = (this.#subscriptions[path] = new Stream<Result>());
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

	addDocument(ref: Documents, data: Data): string | Promise<string> {
		return this.#source.addDocument(ref, data);
	}

	async setDocument(ref: Document, data: Data): Promise<void> {
		await this.#source.setDocument(ref, data);
		this.#gotDocumentState(ref.path, data);
	}

	async updateDocument(ref: Document, data: Partial<Data>): Promise<void> {
		await this.#source.updateDocument(ref, data);
		this.#updateDocumentState(ref.path, data);
	}

	async deleteDocument(ref: Document): Promise<void> {
		await this.#source.deleteDocument(ref);
		this.#gotDocumentState(ref.toString(), undefined);
	}

	/** Get the `State` object for a list of documents. */
	getDocumentsState(ref: Documents): State<Results> {
		return this.#states[ref.toString()] || this.#createDocumentsState(ref, LOADING);
	}
	#createDocumentsState(ref: Documents, value: Results | Promise<Results> | typeof LOADING = LOADING): State<Results> {
		const state = (this.#states[ref.toString()] = new State<Results>(value));
		state.on({
			next: v => {
				for (const [id, data] of Object.entries(v)) this.#gotDocumentState(`${ref.path}/${id}`, data);
			},
		});
		return state;
	}
	#gotDocumentsState(ref: Documents, value: Results | Promise<Results>): void {
		const state = this.getDocumentsState(ref);
		if (state && !state.closed) state.next(value);
		else this.#createDocumentsState(ref, value);
	}

	/**
	 * Get the `State` object for a list of document and refresh its value if we need to.
	 * @param maxAge
	 * - If `maxAge` is a number this specifies how old (in milliseconds
	 */
	refreshDocumentsState(ref: Documents, maxAge: number | true = 1000): void {
		const key = ref.toString();
		const state = this.getDocumentsState(ref);
		if (maxAge === true) {
			// Create a subscription that lasts for 10 seconds.
			if (!this.#subscriptions[key]) setTimeout(this.onDocuments(ref, {}), 10000);
		} else {
			// Fetch the refeshed data once if there isn't an existing subscription, and a fetch isn't already pending, and the data is older than `maxAge`
			if (!this.#subscriptions[key] && !state.pending && state.age < maxAge) void this.getDocuments(ref);
		}
	}

	getDocuments(ref: Documents): Results | Promise<Results> {
		const value = this.#source.getDocuments(ref);
		this.#gotDocumentsState(ref, value);
		return value;
	}

	onDocuments(ref: Documents, observer: Observer<Results>): Unsubscriber {
		const subscription = this.#getDocumentsSubscription(ref);
		subscription.on(observer);
		return () => {
			subscription.off(observer);
			if (subscription.subscribers <= 1) subscription.complete();
		};
	}
	#getDocumentsSubscription(ref: Documents): Stream<Results> {
		const path = ref.path;
		const existingSubscription = this.#subscriptions[path];
		if (existingSubscription) return existingSubscription;
		const newSubscription = (this.#subscriptions[path] = new Stream<Results>());
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

	setDocuments(ref: Documents, data: Data): void | Promise<void> {
		return this.#source.setDocuments(ref, data);
	}

	updateDocuments(ref: Documents, data: Partial<Data>): void | Promise<void> {
		return this.#source.updateDocuments(ref, data);
	}

	deleteDocuments(ref: Documents): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}
