/**
 * Re-exports all icons from `@heroicons/react/24/solid`.
 *
 * Consumers can replace the entire icon set by aliasing `shelving/icon` in their bundler or
 * TypeScript path mappings. For example, to swap in outline variants in a Vite project:
 *
 * ```ts
 * // vite.config.ts
 * resolve: { alias: { "shelving/icon": "@heroicons/react/24/outline" } }
 * ```
 *
 * Or in `tsconfig.json` for type resolution:
 *
 * ```json
 * { "compilerOptions": { "paths": { "shelving/icon": ["./node_modules/@heroicons/react/24/outline"] } } }
 * ```
 */
export * from "@heroicons/react/24/solid";
