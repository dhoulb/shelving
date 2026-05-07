import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * Get a `process.env` variable safely in all environments, or `undefined` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).
 */
export function getEnv(name: string): string | undefined {
	if (typeof process === "object" && typeof process.env === "object") return process.env[name];
}

/**
 * Get a `process.env` variable safely in all environments, or throw `RequiredError` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).
 */
export function requireEnv(name: string, caller: AnyCaller = requireEnv): string {
	const env = getEnv(name);
	if (typeof env !== "string") throw new RequiredError(`Environment variable "${name}" is required`, { caller });
	return env;
}

/**
 * Get a `process.env` variable and resolve it to to `true` or `false`, or `undefined` if it isn't a true/false value.
 */
export function getEnvBoolean(name: string): boolean | undefined {
	const env = getEnv(name)?.toLowerCase();
	if (env && _TRUES.includes(env)) return true;
	if (env && _FALSES.includes(env)) return false;
}
const _TRUES = [`1`, `on`, `yes`, `true`];
const _FALSES = [`0`, `off`, `no`, `false`];

/**
 * Get a `process.env` variable and resolve it to to `true` or `false`
 *
 * @returns `false` if the environment variable is `0`, `off`, `no`, `false`
 * @returns `true` if the environment variable is `1`, `on`, `yes`, `true`
 * @throws `RequiredError` if the env variable is any other value.
 */
export function requireEnvBoolean(name: string, caller: AnyCaller = requireEnvBoolean): boolean {
	const env = getEnv(name);
	if (typeof env !== "boolean") throw new RequiredError(`Environment variable "${name}" must be boolean`, { caller });
	return env;
}

/** The `NO_COLOR` environment variable is commonly used to indicate that ANSI output shouldn't have color. */
export const NO_COLOR = getEnvBoolean("NO_COLOR") ?? false;
