import type { Dependencies } from "../array";

/**
 * Fetcher: a function that fetches a value.
 *
 * @param deps Any parameters that are needed to configure the fetch.
 * @returns The fetched value.
 */
export type Fetcher<T, D extends Dependencies = []> = (...deps: D) => T;

/** `Fetcher` that possibly returns a promise. */
export type AsyncFetcher<T, D extends Dependencies = []> = (...deps: D) => T | Promise<T>;
