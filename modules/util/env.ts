import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * Get a `process.env` variable safely in all environments, or `undefined` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).
 *
 * @param name Name of the environment variable to read.
 * @returns The variable's string value, or `undefined` if missing or unsupported.
 * @example getEnv("NODE_ENV") // "production"
 * @see https://dhoulb.github.io/shelving/util/env/getEnv
 */
export function getEnv(name: string): string | undefined {
	if (typeof process === "object" && typeof process.env === "object") return process.env[name];
}

/**
 * Get a `process.env` variable safely in all environments, or throw `RequiredError` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).
 *
 * @param name Name of the environment variable to read.
 * @param caller Function to attribute a thrown error to (defaults to `requireEnv`).
 * @returns The variable's string value.
 * @throws `RequiredError` if the variable is missing or `process.env` is unsupported.
 * @example requireEnv("DATABASE_URL") // "postgres://..."
 * @see https://dhoulb.github.io/shelving/util/env/requireEnv
 */
export function requireEnv(name: string, caller: AnyCaller = requireEnv): string {
	const env = getEnv(name);
	if (typeof env !== "string") throw new RequiredError(`Environment variable "${name}" is required`, { caller });
	return env;
}

/**
 * Get a `process.env` variable and resolve it to `true` or `false`, or `undefined` if it isn't a true/false value.
 * - Truthy values: `1`, `on`, `yes`, `true` (case-insensitive).
 * - Falsy values: `0`, `off`, `no`, `false` (case-insensitive).
 *
 * @param name Name of the environment variable to read.
 * @returns `true` or `false` if the value is recognised, otherwise `undefined`.
 * @example getEnvBoolean("FEATURE_FLAG") // true
 * @see https://dhoulb.github.io/shelving/util/env/getEnvBoolean
 */
export function getEnvBoolean(name: string): boolean | undefined {
	const env = getEnv(name)?.toLowerCase();
	if (env && _TRUES.includes(env)) return true;
	if (env && _FALSES.includes(env)) return false;
}
const _TRUES = [`1`, `on`, `yes`, `true`];
const _FALSES = [`0`, `off`, `no`, `false`];

/**
 * Get a `process.env` variable and resolve it to `true` or `false`, or throw `RequiredError` if it isn't a true/false value.
 *
 * @param name Name of the environment variable to read.
 * @param caller Function to attribute a thrown error to (defaults to `requireEnvBoolean`).
 * @returns `false` if the environment variable is `0`, `off`, `no`, `false`; `true` if it is `1`, `on`, `yes`, `true`.
 * @throws `RequiredError` if the env variable is any other value.
 * @example requireEnvBoolean("FEATURE_FLAG") // true
 * @see https://dhoulb.github.io/shelving/util/env/requireEnvBoolean
 */
export function requireEnvBoolean(name: string, caller: AnyCaller = requireEnvBoolean): boolean {
	const env = getEnv(name);
	if (typeof env !== "boolean") throw new RequiredError(`Environment variable "${name}" must be boolean`, { caller });
	return env;
}
