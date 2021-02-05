import { UNDEFINED_VALIDATOR, Validator } from "../schema";
import type { Resource } from "./Resource";

/** Create a new abstract function that can be run without an auth token. */
export function createResource<P, R>(payload: Validator<P>, result: Validator<R>): Resource<P, R>;
export function createResource<R>(payload: undefined, result: R): Resource<undefined, R>;
export function createResource<P>(payload: Validator<P>, result?: undefined): Resource<P, undefined>;
export function createResource(payload?: undefined, result?: undefined): Resource<undefined, undefined>;
export function createResource(
	payload: Validator<unknown> = UNDEFINED_VALIDATOR,
	result: Validator<unknown> = UNDEFINED_VALIDATOR,
): Resource<unknown, unknown> {
	return { payload, result };
}
