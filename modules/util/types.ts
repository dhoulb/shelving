/**
 * Helper type to turn a union type into an intersection type.
 * i.e. `A & B` becomes `A | B`
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Helper type to resolve and normalise an object.
 * i.e. `{ a: string } & { b: number }` becomes `{ a: string, b: number }`
 */
export type Resolve<T> = { [K in keyof T]: T[K] };
