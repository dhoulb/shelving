import type { Arguments } from "../function";
import { UNDEFINED_VALIDATOR, Validator } from "../schema";
import type { Resource as ResourceInterface, ResourceResolver } from "./Resource";

/** Create a new abstract function that can be run without an auth token. */
export function createResource<P, R>(payload: Validator<P>, result: Validator<R>): ResourceInterface<P, R>;
export function createResource<R>(payload: undefined, result: R): ResourceInterface<undefined, R>;
export function createResource<P>(payload: Validator<P>, result?: undefined): ResourceInterface<P, undefined>;
export function createResource(payload?: undefined, result?: undefined): ResourceInterface<undefined, undefined>;
export function createResource(
	payload: Validator<unknown> = UNDEFINED_VALIDATOR,
	result: Validator<unknown> = UNDEFINED_VALIDATOR,
): ResourceInterface<unknown, unknown> {
	return new Resource(payload, result);
}

class Resource<P, R> implements ResourceInterface<P, R> {
	get PAYLOAD() {
		return this.payload.validate();
	}
	get RESULT() {
		return this.result.validate();
	}
	readonly payload: Validator<P>;
	readonly result: Validator<R>;
	constructor(payload: Validator<P>, result: Validator<R>) {
		this.payload = payload;
		this.result = result;
	}
	async resolve<A extends Arguments>(resolver: ResourceResolver<P, unknown, A>, payload: unknown, ...args: A): Promise<R> {
		return this.result.validate(await resolver(this.payload.validate(payload), ...args));
	}
}