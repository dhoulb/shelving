import { compareAscending } from "../sort";

/** Function that matches a value. */
export type OperatorFunction<L = unknown, R = unknown> = (target: L, current: R) => boolean;

/** Possible operator references. */
export type Operator = "is" | "not" | "in" | "contains" | "lt" | "lte" | "gt" | "gte";

/** List of matching functions along with their matcher references. */
export const OPERATORS: {
	readonly [K in Operator]: OperatorFunction;
} = {
	is: (target, current) => target === current,
	not: (target, current) => target !== current,
	in: (target, current) => (target instanceof Array ? target.includes(current) : false),
	contains: (target, current) => (current instanceof Array ? current.includes(target) : false),
	lt: (target, current) => compareAscending(current, target) < 0,
	lte: (target, current) => compareAscending(current, target) <= 0,
	gt: (target, current) => compareAscending(current, target) > 0,
	gte: (target, current) => compareAscending(current, target) >= 0,
};
