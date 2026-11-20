# Endpoint.renderPath()

- Kind: method
- Member of: `Endpoint`

Render the path for this endpoint with the given payload.
- Path might contain `{placeholder}` values that are replaced with values from `payload`.

## Signatures

```ts
renderPath(payload: P, caller: AnyCaller = this.renderPath): AbsolutePath
```
