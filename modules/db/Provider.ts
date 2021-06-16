import type { Observer, Unsubscriber, Data, Result, Results } from "../util";
import type { State } from "../stream";
import type { Document } from "./Document";
import type { Documents } from "./Documents";

/**
 * Provider interface: Implemented by classes that provide access to data (e.g. IndexedDB, Firebase, or in-memory cache providers).
 */
export interface Provider {
	/**
	 * Get current state for a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return A `State` instance representing the current state of the document (with `state.value`, `state.loading` and `state.updated` props).
	 */
	currentDocument<T extends Data>(ref: Document<T>): State<Result<T>>;

	/**
	 * Get a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	getDocument<T extends Data>(ref: Document<T>): Result<T> | Promise<Result<T>>;

	/**
	 * Subscribe to a document.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer to report the result back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocument<T extends Data>(ref: Document<T>, observer: Observer<Result<T>>): Unsubscriber;

	/**
	 * Create a new document in a collection by generating a unique ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @return Promise that resolves to the string ID of the created document when done.
	 */
	addDocument<T extends Data>(ref: Documents<T>, data: T): string | Promise<string>;

	/**
	 * Set a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 * @param change The change to update the document (either a diff to update the value, or `undefined` for delete).
	 *
	 * @return Promise that resolves when done.
	 * @throws RequiredError if the document doesn't exist.
	 */
	setDocument<T extends Data>(ref: Document<T>, data: T): void | Promise<void>;

	/**
	 * Update an existing document with a partial value.
	 * - If the document exists, merge the new value into it (deeply).
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 * @param partial Set of updates to make to the document.
	 *
	 * @return Promise that resolves when done.
	 * @throws RequiredError if the document doesn't exist.
	 */
	updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): void | Promise<void>;

	/**
	 * Delete a document.
	 *
	 * @param ref Document reference specifying which document document to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocument<T extends Data>(ref: Document<T>): void | Promise<void>;

	/**
	 * Get current state for a document.
	 *
	 * @param ref Documents reference specifying which collection to count documents from.
	 * @return A `State` instance representing the current state of the documents (with `state.value`, `state.loading` and `state.updated` props).
	 */
	currentDocuments<T extends Data>(ref: Documents<T>): State<Results<T>>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Array of documents matching the rules.
	 */
	getDocuments<T extends Data>(ref: Documents<T>): Results<T> | Promise<Results<T>>;

	/**
	 * Subscribe to all matching documents.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Documents reference specifying which collection to to subscribe to.
	 * @param observer Observer to report the result back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocuments<T extends Data>(ref: Documents<T>, observer: Observer<Results<T>>): Unsubscriber;

	/**
	 * Set all matching documents to the same value.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @return Promise that resolves when done.
	 */
	setDocuments<T extends Data>(ref: Documents<T>, data: T): void | Promise<void>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param ref Documents reference specifying which collection to update.
	 * @return Promise that resolves when done.
	 */
	updateDocuments<T extends Data>(ref: Documents<T>, partial: Partial<T>): void | Promise<void>;

	/**
	 * Delete all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocuments<T extends Data>(ref: Documents<T>): void | Promise<void>;
}
