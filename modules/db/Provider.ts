import type { Observer, Unsubscriber, Data, Result, Results } from "../util";
import type { Document } from "./Document";
import type { Documents } from "./Documents";

/**
 * Provider interface: Implemented by classes that provide access to data (e.g. IndexedDB, Firebase, or in-memory cache providers).
 */
export interface Provider {
	/**
	 * Get a document.
	 *
	 * @param ref Document reference specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	getDocument(ref: Document): Result | Promise<Result>;

	/**
	 * Subscribe to a document.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Document reference specifying which document to subscribe to.
	 * @param observer Observer to report the result back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocument(ref: Document, observer: Observer<Result>): Unsubscriber;

	/**
	 * Create a new document in a collection by generating a unique ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Documents reference specifying which collection to add the document to.
	 * @param data Complete or partial data to set the document to.
	 * - Assumes missing fields in `data` will be handled or set to their default value by the database provider.
	 *
	 * @return Promise that resolves to the string ID of the created document when done.
	 */
	addDocument(ref: Documents, data: Data): string | Promise<string>;

	/**
	 * Set a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document reference specifying which document to set.
	 * @param data Data to set the document to.
	 * - Assumes missing fields in `data` will be handled or set to their default value by the database provider.
	 *
	 * @return Promise that resolves when done.
	 */
	setDocument(ref: Document, data: Data): void | Promise<void>;

	/**
	 * Update an existing document.
	 * - If the document exists, merge the new value into it (deeply).
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document reference specifying which document to merge into.
	 * @param data Partial data to merge into the existing document.
	 *
	 * @return Promise that resolves when done.
	 * @throws RequiredError if the document doesn't exist.
	 */
	updateDocument(ref: Document, data: Partial<Data>): void | Promise<void>;

	/**
	 * Delete a document.
	 *
	 * @param ref Document reference specifying which document document to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocument(ref: Document): void | Promise<void>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to get documents from.
	 * @return Array of documents matching the rules.
	 */
	getDocuments(ref: Documents): Results | Promise<Results>;

	/**
	 * Subscribe to all matching documents.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Documents reference specifying which collection to subscribe to.
	 * @param observer Observer to report the result back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocuments(ref: Documents, observer: Observer<Results>): Unsubscriber;

	/**
	 * Set all matching documents to the same exact value.
	 *
	 * @param ref Documents reference specifying which collection to set.
	 * @param data Data to set every matching document to.
	 * - Assumes missing fields in `data` will be handled or set to their default value by the database provider.
	 *
	 * @return Promise that resolves when done.
	 */
	setDocuments(ref: Documents, data: Data): void | Promise<void>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param ref Documents reference specifying which collection to update.
	 * @param data Partial data to merge into every matching document.
	 * - Assumes missing fields in `data` will be handled or set to their default value by the database provider.
	 *
	 * @return Promise that resolves when done.
	 */
	updateDocuments(ref: Documents, data: Partial<Data>): void | Promise<void>;

	/**
	 * Delete all matching documents.
	 *
	 * @param ref Documents reference specifying which collection to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocuments(ref: Documents): void | Promise<void>;
}
