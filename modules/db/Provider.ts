import type { Observer, Unsubscriber, Data, Result, Results } from "../util";
import type { Document } from "./Document";
import type { Documents } from "./Documents";

/**
 * Provider interface: Implemented by classes that provide access to data (e.g. IndexedDB, Firebase, or in-memory cache providers).
 */
export interface Provider {
	/**
	 * Get the result of a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>>;

	/**
	 * Subscribe to the result of a document.
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document result is reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber;

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete data to set the document to.
	 *
	 * @return String ID for the created document (possibly promised).
	 */
	addDocument<X extends Data>(ref: Documents<X>, data: X): string | Promise<string>;

	/**
	 * Set the complete data of a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to set.
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	setDocument<X extends Data>(ref: Document<X>, data: X): void | Promise<void>;

	/**
	 * Update an existing document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 * @param data Partial data to merge into the existing document.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	updateDocument<X extends Data>(ref: Document<X>, data: Partial<X>): void | Promise<void>;

	/**
	 * Delete an existing document.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	deleteDocument<X extends Data>(ref: Document<X>): void | Promise<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Set of results in `id: data` format.
	 */
	getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>>;

	/**
	 * Subscribe to all matching documents.
	 * - `next()` is called once with the initial results, and again any time the results change.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer with `next`, `error`, or `complete` methods that the document results are reported back to.
	 *
	 * @return Function that ends the subscription.
	 */
	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber;

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param data Complete data to set every matching document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param ref Documents reference specifying which collection to update.
	 * @param data Partial data to merge into every matching document.
	 *
	 * @return Nothing (possibly promised).
	 */
	updateDocuments<X extends Data>(ref: Documents<X>, data: Partial<X>): void | Promise<void>;

	/**
	 * Delete all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to delete.
	 * @return Nothing (possibly promised).
	 */
	deleteDocuments<X extends Data>(ref: Documents<X>): void | Promise<void>;
}
