import { isSchema, schema } from "..";

test("isSchema()", () => {
	// Yes.
	expect(isSchema(schema.string.required)).toEqual(true);
	// No.
	expect(isSchema("a")).toEqual(false);
	expect(isSchema({})).toEqual(false);
	expect(isSchema({ validate: 123 })).toEqual(false);
});
