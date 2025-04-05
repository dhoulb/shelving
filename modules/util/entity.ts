import { ValidationError } from "../error/ValidationError.js";
import type { Optional } from "./optional.js";

/** Entity strings combine a type and ID, e.g. `challenge:a1b2c3` */
export type Entity<T extends string = string> = `${T}:${string}`;

/** Extract the type from an `Entity` string. */
export type EntityType<E extends Entity> = E extends Entity<infer T> ? T : never;

/** Empty entity has undefined type and ID. */
export type EmptyEntity = [type: undefined, id: undefined];

/** Empty entity. */
export const EMPTY_ENTITY: EmptyEntity = [undefined, undefined];

/** Split an entity tag like `challenge:a1b2c3` into `type` and `id` */
export function splitEntity<T extends string>(entity: Entity<T>): [type: T, id: string];
export function splitEntity(entity: string): [type: string, id: string];
export function splitEntity(entity: string): [type: string, id: string] {
	const bits = entity.split(":", 2);
	if (bits[0] && bits[1]) return bits as [type: string, id: string];
	throw new ValidationError("Invalid entity");
}

/** Split an optional entity tag like `challenge:a1b2c3` into `["challenge", "a1b2c3"]`, or `undefined` or `null` */
export function splitOptionalEntity<T extends string>(entity: Entity<T>): [type: T, id: string];
export function splitOptionalEntity<T extends string>(entity: Optional<Entity<T>>): [type: T, id: string] | EmptyEntity;
export function splitOptionalEntity(entity: Optional<string>): [type: string, id: string] | EmptyEntity;
export function splitOptionalEntity(entity: Optional<string>): [type: string, id: string] | EmptyEntity {
	if (entity) {
		const bits = entity.split(":", 2);
		if (bits[0] && bits[1]) return bits as [type: string, id: string];
	}
	return EMPTY_ENTITY;
}
