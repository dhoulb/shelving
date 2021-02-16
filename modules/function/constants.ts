/** Function that just passes through the first argument. */
export const PASSTHROUGH = <T>(value: T): T => value;

/** Function that always returns undefined. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLACKHOLE: (...args: any[]) => void | undefined = () => undefined;
