import { type FileCapture, MEDIA_TYPES } from "../util/file.js";
import { FileSchema, type FileSchemaOptions } from "./FileSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/**
 * Allowed options for `MediaSchema`.
 *
 * @see https://shelving.cc/schema/MediaSchemaOptions
 */
export interface MediaSchemaOptions extends FileSchemaOptions {
	/** Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. */
	readonly capture?: FileCapture | undefined;
}

/**
 * Schema that validates the file name of an image or a video.
 *
 * - The extension must be one of `types` (default `MEDIA_TYPES`).
 * - `capture` tells a file picker to open the camera straight away.
 *
 * @see https://shelving.cc/schema/MediaSchema
 */
export class MediaSchema extends FileSchema {
	/** Which camera a file picker for this schema opens straight away, or `undefined` for the normal picker. */
	readonly capture: FileCapture | undefined;

	constructor({ one = "media", title = "Media", types = MEDIA_TYPES, capture, ...options }: MediaSchemaOptions) {
		super({ one, title, types, ...options });
		this.capture = capture;
	}
}

/**
 * Sugar instance of `MediaSchema` for an image or video file name, e.g. `photo.jpg`. Equivalent to `new MediaSchema({})`.
 *
 * @example MEDIA.validate("clip.mp4"); // Returns "clip.mp4"
 * @see https://shelving.cc/schema/MEDIA
 */
export const MEDIA = new MediaSchema({});

/**
 * Sugar instance allowing a `MEDIA` or `null`. Equivalent to `NULLABLE(MEDIA)`.
 *
 * @example NULLABLE_MEDIA.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_MEDIA
 */
export const NULLABLE_MEDIA = NULLABLE(MEDIA);
