/**
 * Minimal interface matching the Cloudflare Workers KV namespace runtime object.
 *
 * Declares only the subset of methods `CloudflareKVProvider` uses, so the `@cloudflare/workers-types` package is not required as a dependency.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/KVNamespace
 */
export interface KVNamespace {
	get(key: string, options: { type: "json" }): Promise<unknown>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}

/**
 * Value that can be passed through the D1 Worker API as a bound parameter.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1Value
 */
export type D1Value = boolean | null | number | string;

/**
 * Metadata returned by the D1 Worker API alongside a query result.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1Meta
 */
export interface D1Meta {
	readonly changed_db?: boolean | undefined;
	readonly duration?: number | undefined;
	readonly last_row_id?: number | undefined;
	readonly rows_read?: number | undefined;
	readonly rows_written?: number | undefined;
}

/**
 * Result object returned by `D1PreparedStatement.run()`.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1Result
 */
export interface D1Result<T extends Record<string, unknown> = Record<string, unknown>> {
	readonly success: boolean;
	readonly meta?: D1Meta | undefined;
	readonly results?: readonly T[] | undefined;
}

/**
 * Result object returned by `D1Database.exec()`.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1ExecResult
 */
export interface D1ExecResult {
	readonly count: number;
	readonly duration: number;
}

/**
 * Minimal prepared statement interface for D1 databases and sessions.
 *
 * Declares only the subset of the D1 prepared-statement API used by `CloudflareD1Provider`.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1PreparedStatement
 */
export interface D1PreparedStatement {
	bind(...values: D1Value[]): D1PreparedStatement;
	first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
	raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<readonly T[]>;
	run<T extends Record<string, unknown> = Record<string, unknown>>(): Promise<D1Result<T>>;
}

/**
 * Minimal D1 binding/session interface used by `CloudflareD1Provider`.
 *
 * Declares only the subset of the D1 binding API the provider needs, so the `@cloudflare/workers-types` package is not required as a dependency.
 *
 * @see https://dhoulb.github.io/shelving/cloudflare/types/D1Database
 */
export interface D1Database {
	batch<T extends Record<string, unknown> = Record<string, unknown>>(
		statements: readonly D1PreparedStatement[],
	): Promise<readonly D1Result<T>[]>;
	exec?(query: string): Promise<D1ExecResult>;
	prepare(query: string): D1PreparedStatement;
}
