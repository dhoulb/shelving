import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";

/**
 * Entity string combining a type and ID, e.g. `challenge:a1b2c3`
 *
 * @see https://shelving.cc/util/entity/Entity
 */
export type Entity<T extends string = string> = `${T}:${string}`;

/**
 * Extract the type portion from an `Entity` string.
 *
 * @see https://shelving.cc/util/entity/EntityType
 */
export type EntityType<E extends Entity> = E extends Entity<infer T> ? T : never;

/**
 * Tuple representing an empty (invalid) entity, with `undefined` type and ID.
 *
 * @see https://shelving.cc/util/entity/EmptyEntity
 */
export type EmptyEntity = [type: undefined, id: undefined];

/**
 * Shared `EmptyEntity` constant returned when an entity string is invalid.
 *
 * @see https://shelving.cc/util/entity/EMPTY_ENTITY
 */
export const EMPTY_ENTITY: EmptyEntity = [undefined, undefined];

/**
 * Split an optional entity tag like `challenge:a1b2c3` into its `type` and `id`, or return `EmptyEntity` if the entity was invalid.
 *
 * @param entity The entity string to split, or a nullish value.
 * @returns A `[type, id]` tuple, or `EMPTY_ENTITY` if the entity was missing or invalid.
 * @see https://shelving.cc/util/entity/getEntity
 */
export function getEntity<T extends string>(entity: Entity<T>): [type: T, id: string];
export function getEntity<T extends string>(entity: Nullish<Entity<T>>): [type: T, id: string] | EmptyEntity;
export function getEntity(entity: Nullish<string>): [type: string, id: string] | EmptyEntity;
export function getEntity(entity: Nullish<string>): [type: string, id: string] | EmptyEntity {
	if (entity) {
		const bits = entity.split(":", 2);
		if (bits[0] && bits[1]) return bits as [type: string, id: string];
	}
	return EMPTY_ENTITY;
}

/**
 * Split an entity tag like `challenge:a1b2c3` into its `type` and `id`, or throw `RequiredError` if the entity tag was invalid.
 *
 * @param entity The entity string to split.
 * @param caller Function to attribute a thrown error to (defaults to `requireEntity`).
 * @returns A `[type, id]` tuple.
 * @throws {RequiredError} If the entity string is missing or invalid.
 * @see https://shelving.cc/util/entity/requireEntity
 */
export function requireEntity<T extends string>(entity: Entity<T>, caller?: AnyCaller): [type: T, id: string];
export function requireEntity(entity: string, caller?: AnyCaller): [type: string, id: string];
export function requireEntity(entity: string, caller: AnyCaller = requireEntity): [type: string, id: string] {
	const bits = entity.split(":", 2);
	if (bits[0] && bits[1]) return bits as [type: string, id: string];
	throw new RequiredError("Invalid entity", { received: entity, caller });
}
