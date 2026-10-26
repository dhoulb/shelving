# StoreInput

- Kind: type
- Import: `import { StoreInput } from "shelving/store";`

Synchronous values that a store natively knows how to process as inputs.
- A plain input value of type `I`, or the `SKIP` sentinel (ignore this write) or `NONE` sentinel (put the store into a loading state).

## Signatures

```ts
I | typeof SKIP | typeof NONE
```
