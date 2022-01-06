/**
 * This module exports almost everything in Shelving except...
 * - Modules that use peer dependencies, like `shelving/react` and `shelving/firebase-client`
 * - Modules that are for internal testing, like `shelving/test` and
 */

// Data storage.
export * from "./schema/index.js";
export * from "./db/index.js";
export * from "./provider/index.js";
export * from "./query/index.js";
export * from "./api/index.js";

// Utilities.
export * from "./error/index.js";
export * from "./feedback/index.js";
export * from "./markup/index.js";
export * from "./stream/index.js";
export * from "./update/index.js";
export * from "./operation/index.js";
export * from "./util/index.js";

// Integrations.
// export * from "./react/index.js"; // Not exported.

// Testing.
// export * from "./test/index.js"; // Not exported.
