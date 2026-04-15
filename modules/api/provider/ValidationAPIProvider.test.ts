import { describe, expect, test } from "bun:test";
import { DATA, GET, MockAPIProvider, POST, REQUIRED_STRING, ResponseError, STRING, ValidationAPIProvider } from "../../index.js";

describe("ValidationAPIProvider", () => {
	test("validates payloads before calling the source provider", async () => {
		const source = new MockAPIProvider(async () => Response.json("ok"));
		const provider = new ValidationAPIProvider(source);
		const endpoint = POST("/users", DATA({ name: REQUIRED_STRING }), STRING);

		try {
			await provider.call(endpoint, {} as never);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeDefined();
		}

		expect(source.fetchCalls).toHaveLength(0);
	});

	test("validates successful source results against the endpoint result schema", async () => {
		const source = new MockAPIProvider(async () => Response.json(false));
		const provider = new ValidationAPIProvider(source);
		const endpoint = GET("/echo", DATA({ id: STRING }), STRING);

		await expect(provider.call(endpoint, { id: "123" })).rejects.toBeInstanceOf(ResponseError);
		expect(source.fetchCalls).toHaveLength(1);
	});
});
