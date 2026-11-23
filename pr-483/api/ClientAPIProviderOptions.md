# ClientAPIProviderOptions

- Kind: interface
- Import: `import { ClientAPIProviderOptions } from "shelving/api";`

Options for constructing a `ClientAPIProvider`.

## Signatures

```ts
{
	readonly url: PossibleURL;
	readonly options?: Omit<RequestOptions, "signal">;
	readonly timeout?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURL` | The common base URL for all rendered endpoint requests. Note: When resolving URLs for endpoints this is treated as if it ends in a slash. - e.g. in `http://p.com/a/b/c` the path will be relative to `c` as if a `/` trailing slash was present. - This is different to the default behaviour of `new URL()`, but is the more natural expected result - This is consistent with our e.g. `getURL()` utilities. Read only. |
| `options` | `Omit<RequestOptions, "signal">` | Options used for HTTP requests created with `this.createRequest()` and `this.fetch()` - Omits `signal` because it's not relevant at the provider level. Read only. Optional. |
| `timeout` | `number \| undefined` | Timeout in milliseconds before the request is aborted with `TimeoutError`. - Defaults to `20_000` (20 seconds) — chosen to fire before common platform wall-clock caps (Cloudflare Workers ~30s, Vercel/AWS API Gateway ~29s) so the abort propagates as a clean rejection instead of an opaque runtime termination. - Pass `0` to disable the timeout (e.g. for streaming or long-poll endpoints). Raise it for specifically slow endpoints. Read only. Optional. |
