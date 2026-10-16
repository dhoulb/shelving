import { IMAGE_TYPES } from "../util/file.js";
import { MediaSchema, type MediaSchemaOptions } from "./MediaSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/**
 * Schema that validates the file name of an image.
 *
 * - The extension must be one of `types` (default `IMAGE_TYPES`).
 *
 * @see https://shelving.cc/schema/ImageSchema
 */
export class ImageSchema extends MediaSchema {
	constructor({ one = "image", title = "Image", types = IMAGE_TYPES, ...options }: MediaSchemaOptions) {
		super({ one, title, types, ...options });
	}
}

/**
 * Sugar instance of `ImageSchema` for an image file name, e.g. `photo.jpg`. Equivalent to `new ImageSchema({})`.
 *
 * @example IMAGE.validate("photo.jpg"); // Returns "photo.jpg"
 * @see https://shelving.cc/schema/IMAGE
 */
export const IMAGE = new ImageSchema({});

/**
 * Sugar instance allowing an `IMAGE` or `null`. Equivalent to `NULLABLE(IMAGE)`.
 *
 * @example NULLABLE_IMAGE.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_IMAGE
 */
export const NULLABLE_IMAGE = NULLABLE(IMAGE);
