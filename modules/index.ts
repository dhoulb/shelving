/**
 * This module exports almost everything in Shelving except...
 * - Modules that use peer dependencies, like `shelving/react` and `shelving/firebase-client`
 * - Modules that are for internal testing, like `shelving/test` and
 */

// Internal.
export * from "./constants";

// Data storage.
export * from "./schema";
export * from "./db";
export * from "./query";
export * from "./api";

// Data providers.
export * from "./memory";
// export * from "./firestore-client"; // Not exported.
// export * from "./firestore-server"; // Not exported.

// Data types.
export * from "./array";
export * from "./boolean";
export * from "./class";
export * from "./data";
export * from "./date";
export * from "./entry";
export * from "./function";
export * from "./null";
export * from "./number";
export * from "./object";
export * from "./string";
export * from "./undefined";
export * from "./units";
export * from "./url";

// Data manipulation.
export * from "./clone";
export * from "./diff";
export * from "./equal";
export * from "./filter";
export * from "./markup";
export * from "./merge";
export * from "./random";
export * from "./serialise";
export * from "./sort";
export * from "./template";
export * from "./stream";

// Errors.
export * from "./assert";
export * from "./console";
export * from "./debug";
export * from "./errors";
export * from "./feedback";

// Integrations.
// export * from "./react"; // Not exported.

// Testing.
// export * from "./test"; // Not exported.
