import type { ByteView, ArrayBufferView } from "multiformats";
import { z } from "zod";

export const stringSchema = z.string();
export const numberSchema = z.number();
export const dateSchema = z.iso.date();
export const playlistRecordSchema = z.object({}).catchall(z.unknown());
export const playlistRecordArraySchema = z.array(playlistRecordSchema);

export const trackShapeSchema = z.object({
  location: stringSchema.optional(),
  identifier: stringSchema.optional(),
  title: stringSchema.optional(),
  creator: stringSchema.optional(),
  annotation: stringSchema.optional(),
  info: stringSchema.optional(),
  image: stringSchema.optional(),
  album: stringSchema.optional(),
  trackNum: numberSchema.optional(),
  duration: numberSchema.optional(),
  link: playlistRecordArraySchema.optional(),
  meta: playlistRecordArraySchema.optional(),
  extension: playlistRecordSchema.optional(),
});

export const trackShapeArraySchema = z.array(trackShapeSchema);

export const cspfShapeSchema = z.object({
  title: stringSchema.optional(),
  creator: stringSchema.optional(),
  annotation: stringSchema.optional(),
  info: stringSchema.optional(),
  location: stringSchema.optional(),
  identifier: stringSchema.optional(),
  image: stringSchema.optional(),
  date: z.union([stringSchema, dateSchema]).optional(),
  license: stringSchema.optional(),
  attribution: playlistRecordArraySchema.optional(),
  link: playlistRecordArraySchema.optional(),
  meta: playlistRecordArraySchema.optional(),
  extension: playlistRecordSchema.optional(),
  track: trackShapeArraySchema,
});

export type PlaylistRecord = z.infer<typeof playlistRecordSchema>;
export type TrackShape = z.infer<typeof trackShapeSchema>;
export type CspfShape = z.infer<typeof cspfShapeSchema>;

export const isString = (value: unknown): value is string =>
  stringSchema.safeParse(value).success;
export const isNumber = (value: unknown): value is number =>
  numberSchema.safeParse(value).success;
export const isPlainObject = (value: unknown): value is PlaylistRecord =>
  playlistRecordSchema.safeParse(value).success;
export const isDate = (value: unknown): value is Date =>
  dateSchema.safeParse(value).success;
export const isPlaylistRecordArray = (
  value: unknown
): value is PlaylistRecord[] =>
  playlistRecordArraySchema.safeParse(value).success;

export type ByteSource<T = unknown> = ByteView<T> | ArrayBufferView<T>;
