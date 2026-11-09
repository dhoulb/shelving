# shelving/util/http

- Kind: module
- Import: `import { … } from "shelving/util/http";`

Typed utilities for building and parsing `Request` and `Response` objects using the standard Fetch API. The helpers handle content-type negotiation, body serialisation, and error-to-response conversion so you don't have to repeat that logic in every endpoint or client.

**Things to know:**

- `createRequest()` is the smart constructor — it inspects the payload type and picks the right content type automatically. Use the specific `createJSONRequest()`, `createTextRequest()`, etc. when you need explicit control.
- `GET` and `HEAD` requests cannot carry a body. Pass a `Data` object as the payload and it becomes `?query` params; anything else throws `RequiredError`.
- `getErrorResponse()` never leaks error details by default — pass `debug: true` only in development.
- `mergeRequestOptions()` merges headers by key and combines two `AbortSignal`s so either one cancels the request.

## Usage

### Creating requests

```ts
import { createRequest, createJSONRequest, createHeadRequest } from "shelving/util";

// Smart constructor — picks content type from payload.
createRequest("POST", "https://api.example.com/items", { name: "Widget" });
createRequest("GET",  "https://api.example.com/items", { status: "active" });
// GET → appends ?status=active to URL

// Explicit JSON request.
createJSONRequest("PUT", "https://api.example.com/items/1", { name: "Widget" });

// Body-less GET with query params.
createHeadRequest("GET", "https://api.example.com/search", { q: "hello" });
```

### Parsing request and response bodies

```ts
import { parseRequestBody, parseRequestJSON, parseResponseBody } from "shelving/util";

// In a server handler:
const body = await parseRequestBody(request); // respects Content-Type
const json = await parseRequestJSON(request); // always expects JSON

// After fetch():
const data = await parseResponseBody(response);
```

### Building responses

```ts
import { getResponse, getErrorResponse } from "shelving/util";

// In a request handler:
return getResponse({ id: "1", name: "Widget" }); // 200 with JSON body
return getResponse(undefined);                    // 204 No Content

// In a catch block:
return getErrorResponse(error);           // 500, no details
return getErrorResponse(error, true);     // 500, includes message in dev
```

### Merging request options

```ts
import { mergeRequestOptions } from "shelving/util";

const defaults = { headers: { Authorization: "Bearer token" }, credentials: "include" };
const overrides = { headers: { "X-Request-ID": "abc" }, signal: controller.signal };

const merged = mergeRequestOptions(defaults, overrides);
// headers: { Authorization: "Bearer token", "X-Request-ID": "abc" }
```


## Functions

- [parseRequestBody()](http/parseRequestBody.md): Parse the body content of an HTTP Request based on its content type, or throw RequestError if the content could not be parsed.
- [parseRequestJSON()](http/parseRequestJSON.md): Parse JSON from an HTTP Request, or return undefined when the request has no body.
- [parseRequestFormData()](http/parseRequestFormData.md): Parse FormData from an HTTP Request, or return undefined when the request has no body.
- [parseResponseBody()](http/parseResponseBody.md): Parse the body content of an HTTP Response based on its content type, or throw ResponseError if the content could not be parsed.
- [parseResponseJSON()](http/parseResponseJSON.md): Parse JSON from an HTTP Response, or return undefined when the response has no body.
- [parseResponseFormData()](http/parseResponseFormData.md): Parse FormData from an HTTP Response, or return undefined when the response has no body.
- [getResponse()](http/getResponse.md): Get an HTTP Response for an unknown value.
- [getErrorResponse()](http/getErrorResponse.md): Get an HTTP Response for an unknown error value.
- [isRequestMethod()](http/isRequestMethod.md): Is a string a supported HTTP request method?
- [isRequestHeadMethod()](http/isRequestHeadMethod.md): Is a string a supported HTTP request method that never sends a body?
- [mergeRequestOptions()](http/mergeRequestOptions.md): Merge provider-level and call-level request options.
- [createHeadRequest()](http/createHeadRequest.md): Create a body-less Request.
- [createTextRequest()](http/createTextRequest.md): Create a plain-text Request.
- [createJSONRequest()](http/createJSONRequest.md): Create a JSON Request.
- [createFormDataRequest()](http/createFormDataRequest.md): Create a multipart form-data Request.
- [createXMLRequest()](http/createXMLRequest.md): Create an XML Request.
- [createRequest()](http/createRequest.md): Create a Request instance with a valid content type based on the body.
- [assertRequestHeadPayload()](http/assertRequestHeadPayload.md): Assert that the payload for a HEAD or GET method is a data object, null, or undefined.

## Types

- [RequestHandler](http/RequestHandler.md): A handler function takes a Request and optional extra arguments and returns a Response (possibly asynchronously).
- [OptionalRequestHandler](http/OptionalRequestHandler.md): An optional request handler that may return undefined to indicate no match.
- [OptionalRequestHandlers](http/OptionalRequestHandlers.md): A list of optional request handlers.
- [RequestHeadMethod](http/RequestHeadMethod.md): HTTP request methods that have no body.
- [RequestBodyMethod](http/RequestBodyMethod.md): HTTP request methods that have a body.
- [RequestMethod](http/RequestMethod.md): HTTP request methods.
- [RequestParams](http/RequestParams.md): Params in requests are a dictionary of strings.
- [RequestOptions](http/RequestOptions.md): Configurable options for endpoint requests.
