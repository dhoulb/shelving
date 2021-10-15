import { isSchema, StringSchema } from "../index.js";

test("isSchema()", () => {
	// Yes.
	expect(isSchema(StringSchema.REQUIRED)).toEqual(true);
	// No.
	expect(isSchema("a")).toEqual(false);
	expect(isSchema({})).toEqual(false);
	expect(isSchema({ validate: 123 })).toEqual(false);
});
