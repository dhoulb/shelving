# OptionalRequestHandler

- Kind: type
- Import: `import { OptionalRequestHandler } from "shelving/util/http";`

An optional request handler that may return `undefined` to indicate no match.

## Signatures

```ts
(request: Request, ...args: A) => Response | Promise<Response> | undefined
```

## Types

- `Request`
- `Response`
- `Promise`
