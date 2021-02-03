import { data, DataSchema, DataSchemas, number, Validator } from "..";

// Tests.
describe("DataSchema", () => {
	test("TypeScript validate()", () => {
		// Test object.optional()
		const dataSchema = data({ props: { num: number.optional } });
		const dataType: DataSchema<{ num: number | null }, DataSchemas, DataSchemas> = dataSchema;
		const dataValue: { num: number | null } | null = dataSchema.validate({ num: 123 });
		const dataPropSchema = dataSchema.props.num;
		const dataPropType: Validator<number | null> = dataPropSchema;
		const dataPropValue: number | null = dataPropSchema.validate(123);
	});
});
