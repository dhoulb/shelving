import type { Data, Result, Results } from "../data";
import type { ErrorDispatcher, Dispatcher, UnsubscribeDispatcher } from "../dispatch";
import type { Document } from "./Document";
import type { Collection } from "./Collection";

/**
 * Provider interface: Implemented by classes that provide access to data (e.g. IndexedDB, Firebase, or in-memory cache providers).
 */
export interface Provider {
	/**
	 * Get a document.
	 *
	 * @param ref Document specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	getDocument<T extends Data>(ref: Document<T>): Promise<Result<T>>;

	/**
	 * Subscribe to a document.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Document specifying which document to subscribe to.
	 * @param onNext(next, last?) Function that is called whenever doc changes.
	 *     @param next First param of `onNext()` should always return the current result.
	 *     @param last Second param of `onNext()` returns the result from the last time `onNext()` was called (this allows `next` and `last` to be diffed for changes etc).
	 * @param onError(err) Function that is called if there is an error in the onNext callback or th internal operation of the subscription.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocument<T extends Data>(ref: Document<T>, onNext: Dispatcher<Result<T>>, onError: ErrorDispatcher): UnsubscribeDispatcher;

	/**
	 * Create a new document in a collection by generating a unique ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Collection specifying which collection to add the document to.
	 * @return Document that was added (pointer that includes `.id` and `.data` props).
	 */
	addDocument<T extends Data>(ref: Collection<T>, data: T): Promise<string>;

	/**
	 * Set an existing document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document specifying which document to merge into.
	 * @param change The change to update the document (either a diff to update the value, or `undefined` for delete).
	 * @return The change that was applied to the document (either a diff of what was updated on the value, or `undefined` for deleted), or `undefined` if no change was made.
	 *
	 * @throws RequiredError if the document doesn't exist.
	 */
	setDocument<T extends Data>(ref: Document<T>, data: T): Promise<void>;

	/**
	 * Update an existing document.
	 * - If the document exists, merge the new value into it (deeply).
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document specifying which document to merge into.
	 * @param updates Set of updates to make to the document.
	 * @return The change that was applied to the document (either a diff of what was updated on the value, or `undefined` for deleted), or `undefined` if no change was made.
	 *
	 * @throws RequiredError if the document doesn't exist.
	 */
	updateDocument<T extends Data>(ref: Document<T>, updates: Partial<T>): Promise<void>;

	/**
	 * Delete a document.
	 *
	 * @param ref Document specifying which document document to delete.
	 * @return The change that was applied to the document (either a diff of what was updated on the value, or `undefined` for deleted), or `undefined` if no change was made.
	 */
	deleteDocument<T extends Data>(ref: Document<T>): Promise<void>;

	/**
	 * Count a list of documents.
	 * - This is implemented separately to `getCollection()` because sometimes counting is significantly more efficient than reading every document.
	 *
	 * @param ref Collection specifying which collection to count documents from.
	 * @return Array of documents matching the rules.
	 */
	countCollection<T extends Data>(ref: Collection<T>): Promise<number>;

	/**
	 * Get a list of documents.
	 *
	 * @param ref Collection specifying which collection to get documents from.
	 * @return Array of documents matching the rules.
	 */
	getCollection<T extends Data>(ref: Collection<T>): Promise<Results<T>>;

	/**
	 * Subscribe to a list of documents.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Collection specifying which collection to to subscribe to.
	 * @param onNext(docs) Function that is called whenever the collection changes.
	 * @param onError(err) Function that is called if there is an error in the onNext callback or th internal operation of the subscription.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onCollection<T extends Data>(ref: Collection<T>, onNext: Dispatcher<Results<T>>, onError: ErrorDispatcher): UnsubscribeDispatcher;
}
