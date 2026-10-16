import { VIDEO_TYPES } from "../util/file.js";
import { MediaSchema, type MediaSchemaOptions } from "./MediaSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/**
 * Schema that validates the file name of a video.
 *
 * - The extension must be one of `types` (default `VIDEO_TYPES`).
 *
 * @see https://shelving.cc/schema/VideoSchema
 */
export class VideoSchema extends MediaSchema {
	constructor({ one = "video", title = "Video", types = VIDEO_TYPES, ...options }: MediaSchemaOptions) {
		super({ one, title, types, ...options });
	}
}

/**
 * Sugar instance of `VideoSchema` for a video file name, e.g. `clip.mp4`. Equivalent to `new VideoSchema({})`.
 *
 * @example VIDEO.validate("clip.mp4"); // Returns "clip.mp4"
 * @see https://shelving.cc/schema/VIDEO
 */
export const VIDEO = new VideoSchema({});

/**
 * Sugar instance allowing a `VIDEO` or `null`. Equivalent to `NULLABLE(VIDEO)`.
 *
 * @example NULLABLE_VIDEO.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_VIDEO
 */
export const NULLABLE_VIDEO = NULLABLE(VIDEO);
