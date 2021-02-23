import type { Arguments } from "./types";

/**
 * Fetcher: a function that fetches a value.
 *
 * @param ...args Any arguments the fetcher needs.
 * @returns The fetched value.
 */
export type Fetcher<T, A extends Arguments = []> = (...args: A) => T;

/** `Fetcher` that possibly returns a promise. */
export type AsyncFetcher<T, A extends Arguments = []> = (...args: A) => T | Promise<T>;
