import { useRef } from "react";
import type { Data } from "../util/data.js";

/** Store internal implementation details for a hook that persist for the lifetime of the component. */
export const useInternals: <T extends Data>() => T | { [K in keyof T]: undefined } = useRef;
