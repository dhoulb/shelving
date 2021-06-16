/**
 * This module exports almost everything in Shelving except...
 * - Modules that use peer dependencies, like `shelving/react` and `shelving/firebase-client`
 * - Modules that are for internal testing, like `shelving/test` and
 */

// Data storage.
export * from "./schema";
export * from "./db";
export * from "./query";
export * from "./api";

// Data providers.
// export * from "./firestore-client"; // Not exported.
// export * from "./firestore-server"; // Not exported.

// Utilities.
export * from "./util";
export * from "./stream";
export * from "./markup";
export * from "./errors";
export * from "./feedback";

// Integrations.
// export * from "./react"; // Not exported.

// Testing.
// export * from "./test"; // Not exported.
