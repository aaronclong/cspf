import { encode, decode } from "@ipld/dag-cbor";
import type { ByteView, ArrayBufferView } from "multiformats";

export type PlaylistRecord = Record<string, unknown>;

export interface TrackShape {
  location: string;
  identifier: string;
  title: string;
  creator: string;
  annotation: string;
  info: string;
  image: string;
  album: string;
  trackNum: number;
  duration: number;
  link: PlaylistRecord[];
  meta: PlaylistRecord[];
  extension: PlaylistRecord;
}

export interface CspfShape {
  title: string;
  creator: string;
  annotation: string;
  info: string;
  location: string;
  identifier: string;
  image: string;
  date: string | Date;
  license: string;
  attribution: PlaylistRecord[];
  link: PlaylistRecord[];
  meta: PlaylistRecord[];
  extension: PlaylistRecord;
  track: TrackShape[];
}

type OperationCallback = (
  isError: boolean,
  message: string,
  err?: Error
) => void;
type TrackInitializer = Partial<TrackShape>;
type CspfInitializer = Partial<Omit<CspfShape, "track">> & {
  track?: Array<TrackShape | Track>;
};

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isPlainObject = (value: unknown): value is PlaylistRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

type ByteSource<T = undefined> = ByteView<T> | ArrayBufferView<T>;

const arraysEqual = (left: unknown[], right: unknown[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => valuesEqual(entry, right[index]));
};

const objectsEqual = (left: PlaylistRecord, right: PlaylistRecord): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(right, key) &&
      valuesEqual(left[key], right[key])
  );
};

const valuesEqual = (left: unknown, right: unknown): boolean => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return arraysEqual(left, right);
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    return objectsEqual(left, right);
  }

  return Object.is(left, right);
};

export class Track {
  location: string;
  identifier: string;
  title: string;
  creator: string;
  annotation: string;
  info: string;
  image: string;
  album: string;
  trackNum: number;
  duration: number;
  link: PlaylistRecord[];
  meta: PlaylistRecord[];
  extension: PlaylistRecord;

  constructor(init?: TrackInitializer) {
    this.location = init?.location ?? "";
    this.identifier = init?.identifier ?? "";
    this.title = init?.title ?? "";
    this.creator = init?.creator ?? "";
    this.annotation = init?.annotation ?? "";
    this.info = init?.info ?? "";
    this.image = init?.image ?? "";
    this.album = init?.album ?? "";
    this.trackNum = init?.trackNum ?? 0;
    this.duration = init?.duration ?? 0;
    this.link = init?.link ? [...init.link] : [];
    this.meta = init?.meta ? [...init.meta] : [];
    this.extension = init?.extension ? { ...init.extension } : {};
  }

  setLocation(location: string): boolean {
    if (!isString(location)) return false;
    this.location = location;
    return true;
  }

  getLocation(): string {
    return this.location;
  }

  setIdentifier(identifier: string): boolean {
    if (!isString(identifier)) return false;
    this.identifier = identifier;
    return true;
  }

  getIdentifier(): string {
    return this.identifier;
  }

  setTitle(title: string): boolean {
    if (!isString(title)) return false;
    this.title = title;
    return true;
  }

  getTitle(): string {
    return this.title;
  }

  setCreator(creator: string): boolean {
    if (!isString(creator)) return false;
    this.creator = creator;
    return true;
  }

  getCreator(): string {
    return this.creator;
  }

  setAnnotation(annotation: string): boolean {
    if (!isString(annotation)) return false;
    this.annotation = annotation;
    return true;
  }

  getAnnotation(): string {
    return this.annotation;
  }

  setInfo(info: string): boolean {
    if (!isString(info)) return false;
    this.info = info;
    return true;
  }

  getInfo(): string {
    return this.info;
  }

  setImage(image: string): boolean {
    if (!isString(image)) return false;
    this.image = image;
    return true;
  }

  getImage(): string {
    return this.image;
  }

  setAlbum(album: string): boolean {
    if (!isString(album)) return false;
    this.album = album;
    return true;
  }

  getAlbum(): string {
    return this.album;
  }

  setTrackNum(trackNum: number): boolean {
    if (!isNumber(trackNum)) return false;
    this.trackNum = trackNum;
    return true;
  }

  getTrackNum(): number {
    return this.trackNum;
  }

  setDuration(duration: number): boolean {
    if (!isNumber(duration)) return false;
    this.duration = duration;
    return true;
  }

  getDuration(): number {
    return this.duration;
  }

  setLink(link: PlaylistRecord[]): boolean {
    if (!Array.isArray(link)) return false;
    this.link = [...link];
    return true;
  }

  getLink(): PlaylistRecord[] {
    return this.link;
  }

  setMeta(meta: PlaylistRecord[]): boolean {
    if (!Array.isArray(meta)) return false;
    this.meta = [...meta];
    return true;
  }

  getMeta(): PlaylistRecord[] {
    return this.meta;
  }

  setExtension(extension: PlaylistRecord): boolean {
    if (!isPlainObject(extension)) return false;
    this.extension = { ...extension };
    return true;
  }

  getExtension(): PlaylistRecord {
    return this.extension;
  }

  isTrack(arg: unknown): arg is Track {
    return arg instanceof Track;
  }

  compare(track: Track): boolean {
    if (!this.isTrack(track)) return false;

    return (
      this.location === track.location &&
      this.identifier === track.identifier &&
      this.title === track.title &&
      this.creator === track.creator &&
      this.annotation === track.annotation &&
      this.info === track.info &&
      this.image === track.image &&
      this.album === track.album &&
      this.trackNum === track.trackNum &&
      this.duration === track.duration &&
      arraysEqual(this.link, track.link) &&
      arraysEqual(this.meta, track.meta) &&
      objectsEqual(this.extension, track.extension)
    );
  }

  parsable(arg: unknown): arg is TrackShape {
    return Track.isParsable(arg);
  }

  toString(): string {
    return JSON.stringify(this);
  }

  static isParsable(arg: unknown): arg is TrackShape {
    if (!isPlainObject(arg)) return false;

    return (
      isString(arg.location) &&
      isString(arg.identifier) &&
      isString(arg.title) &&
      isString(arg.creator) &&
      isString(arg.annotation) &&
      isString(arg.info) &&
      isString(arg.image) &&
      isString(arg.album) &&
      isNumber(arg.trackNum) &&
      isNumber(arg.duration) &&
      Array.isArray(arg.link) &&
      Array.isArray(arg.meta) &&
      isPlainObject(arg.extension)
    );
  }

  static from(track: Track | TrackShape): Track {
    if (track instanceof Track) {
      return track;
    }

    if (!Track.isParsable(track)) {
      throw new TypeError("Track payload is not parsable");
    }

    return new Track(track);
  }
}

export class Cspf {
  title: string;
  creator: string;
  annotation: string;
  info: string;
  location: string;
  identifier: string;
  image: string;
  date: string | Date;
  license: string;
  attribution: PlaylistRecord[];
  link: PlaylistRecord[];
  meta: PlaylistRecord[];
  extension: PlaylistRecord;
  track: Track[];

  constructor(init?: CspfInitializer) {
    this.title = init?.title ?? "";
    this.creator = init?.creator ?? "";
    this.annotation = init?.annotation ?? "";
    this.info = init?.info ?? "";
    this.location = init?.location ?? "";
    this.identifier = init?.identifier ?? "";
    this.image = init?.image ?? "";
    this.date = init?.date ?? "";
    this.license = init?.license ?? "";
    this.attribution = init?.attribution ? [...init.attribution] : [];
    this.link = init?.link ? [...init.link] : [];
    this.meta = init?.meta ? [...init.meta] : [];
    this.extension = init?.extension ? { ...init.extension } : {};
    const tracks = init?.track ?? [];
    this.track = Array.isArray(tracks)
      ? tracks.map((entry) => Track.from(entry))
      : [];
  }

  setTitle(title: string): boolean {
    if (!isString(title)) return false;
    this.title = title;
    return true;
  }

  getTitle(): string {
    return this.title;
  }

  setCreator(creator: string): boolean {
    if (!isString(creator)) return false;
    this.creator = creator;
    return true;
  }

  getCreator(): string {
    return this.creator;
  }

  setAnnotation(annotation: string): boolean {
    if (!isString(annotation)) return false;
    this.annotation = annotation;
    return true;
  }

  getAnnotation(): string {
    return this.annotation;
  }

  setInfo(info: string): boolean {
    if (!isString(info)) return false;
    this.info = info;
    return true;
  }

  getInfo(): string {
    return this.info;
  }

  setLocation(location: string): boolean {
    if (!isString(location)) return false;
    this.location = location;
    return true;
  }

  getLocation(): string {
    return this.location;
  }

  setIdentifier(identifier: string): boolean {
    if (!isString(identifier)) return false;
    this.identifier = identifier;
    return true;
  }

  getIdentifier(): string {
    return this.identifier;
  }

  setImage(image: string): boolean {
    if (!isString(image)) return false;
    this.image = image;
    return true;
  }

  getImage(): string {
    return this.image;
  }

  setDate(date: string | Date): boolean {
    if (!isString(date) && !isDate(date)) return false;
    this.date = date;
    return true;
  }

  getDate(): string | Date {
    return this.date;
  }

  setLicense(license: string): boolean {
    if (!isString(license)) return false;
    this.license = license;
    return true;
  }

  getLicense(): string {
    return this.license;
  }

  setAttribution(attribution: PlaylistRecord[]): boolean {
    if (!Array.isArray(attribution)) return false;
    this.attribution = [...attribution];
    return true;
  }

  getAttribution(): PlaylistRecord[] {
    return this.attribution;
  }

  setLink(link: PlaylistRecord[]): boolean {
    if (!Array.isArray(link)) return false;
    this.link = [...link];
    return true;
  }

  getLink(): PlaylistRecord[] {
    return this.link;
  }

  setMeta(meta: PlaylistRecord[]): boolean {
    if (!Array.isArray(meta)) return false;
    this.meta = [...meta];
    return true;
  }

  getMeta(): PlaylistRecord[] {
    return this.meta;
  }

  setExtension(extension: PlaylistRecord): boolean {
    if (!isPlainObject(extension)) return false;
    this.extension = { ...extension };
    return true;
  }

  getExtension(): PlaylistRecord {
    return this.extension;
  }

  setTrack(track: Array<Track | TrackShape>): boolean {
    if (!Array.isArray(track)) return false;
    const nextTracks: Track[] = [];
    for (const entry of track) {
      try {
        nextTracks.push(Track.from(entry));
      } catch {
        return false;
      }
    }
    this.track = nextTracks;
    return true;
  }

  getTrack(): Track[] {
    return this.track;
  }

  getTrackById(trackId: number): Track | undefined {
    return this.track[trackId];
  }

  isTrack(track: unknown): track is Array<Track | TrackShape> {
    return (
      Array.isArray(track) &&
      track.every((entry) => entry instanceof Track || Track.isParsable(entry))
    );
  }

  isParsableTrack(track: unknown): track is TrackShape[] {
    return (
      Array.isArray(track) && track.every((entry) => Track.isParsable(entry))
    );
  }

  addTrack(
    location = "",
    identifier = "",
    title = "",
    creator = "",
    annotation = "",
    info = "",
    image = "",
    album = "",
    trackNum = 0,
    duration = 0,
    link: PlaylistRecord[] = [],
    meta: PlaylistRecord[] = [],
    extension: PlaylistRecord = {}
  ): boolean {
    this.track.push(
      new Track({
        location,
        identifier,
        title,
        creator,
        annotation,
        info,
        image,
        album,
        trackNum,
        duration,
        link,
        meta,
        extension,
      })
    );
    return true;
  }

  pushTrack(track: Track | TrackShape): boolean {
    try {
      this.track.push(Track.from(track));
      return true;
    } catch {
      return false;
    }
  }

  removeTrack(track: Track | TrackShape): boolean {
    let candidate: Track;
    try {
      candidate = Track.from(track);
    } catch {
      return false;
    }

    const index = this.track.findIndex((entry) => entry.compare(candidate));
    if (index === -1) {
      return false;
    }

    this.track.splice(index, 1);
    return true;
  }

  private updateTrackField(
    trackId: number,
    updater: (track: Track) => boolean
  ): boolean {
    if (
      !Number.isInteger(trackId) ||
      trackId < 0 ||
      trackId >= this.track.length
    ) {
      return false;
    }

    return updater(this.track[trackId]);
  }

  setTrackLocation(trackId: number, location: string): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setLocation(location)
    );
  }

  setTrackIdentifier(trackId: number, identifier: string): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setIdentifier(identifier)
    );
  }

  setTrackTitle(trackId: number, title: string): boolean {
    return this.updateTrackField(trackId, (track) => track.setTitle(title));
  }

  setTrackCreator(trackId: number, creator: string): boolean {
    return this.updateTrackField(trackId, (track) => track.setCreator(creator));
  }

  setTrackAnnotation(trackId: number, annotation: string): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setAnnotation(annotation)
    );
  }

  setTrackInfo(trackId: number, info: string): boolean {
    return this.updateTrackField(trackId, (track) => track.setInfo(info));
  }

  setTrackImage(trackId: number, image: string): boolean {
    return this.updateTrackField(trackId, (track) => track.setImage(image));
  }

  setTrackAlbum(trackId: number, album: string): boolean {
    return this.updateTrackField(trackId, (track) => track.setAlbum(album));
  }

  setTrackTrackNum(trackId: number, trackNum: number): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setTrackNum(trackNum)
    );
  }

  setTrackDuration(trackId: number, duration: number): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setDuration(duration)
    );
  }

  setTrackLink(trackId: number, link: PlaylistRecord[]): boolean {
    return this.updateTrackField(trackId, (track) => track.setLink(link));
  }

  setTrackMeta(trackId: number, meta: PlaylistRecord[]): boolean {
    return this.updateTrackField(trackId, (track) => track.setMeta(meta));
  }

  setTrackExtension(trackId: number, extension: PlaylistRecord): boolean {
    return this.updateTrackField(trackId, (track) =>
      track.setExtension(extension)
    );
  }

  toJson(): Record<string, unknown> {
    return {
      title: this.title,
      creator: this.creator,
      annotation: this.annotation,
      info: this.info,
      location: this.location,
      identifier: this.identifier,
      image: this.image,
      date: this.date,
      license: this.license,
      attribution: this.attribution,
      link: this.link,
      meta: this.meta,
      extension: this.extension,
      track: this.track,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }

  isCspf(arg: unknown): arg is Cspf {
    return arg instanceof Cspf;
  }

  parsable(arg: unknown): arg is CspfShape {
    return Cspf.isParsable(arg);
  }

  static isParsable(arg: unknown): arg is CspfShape {
    if (!isPlainObject(arg)) return false;

    return (
      isString(arg.title) &&
      isString(arg.creator) &&
      isString(arg.annotation) &&
      isString(arg.info) &&
      isString(arg.location) &&
      isString(arg.identifier) &&
      isString(arg.image) &&
      (isString(arg.date) || isDate(arg.date)) &&
      isString(arg.license) &&
      Array.isArray(arg.attribution) &&
      Array.isArray(arg.link) &&
      Array.isArray(arg.meta) &&
      isPlainObject(arg.extension) &&
      Array.isArray(arg.track) &&
      arg.track.every((entry) => Track.isParsable(entry))
    );
  }

  toBytes(): Uint8Array {
    return encode(this.toJson());
  }

  loadFromBytes(bytes: ByteSource, callback?: OperationCallback): void {
    try {
      const parsed: unknown = decode(bytes);
      if (!Cspf.isParsable(parsed)) {
        throw new Error("Object stored in payload is not a CSPF playlist");
      }
      this.hydrate(parsed);
      callback?.(false, "Playlist loaded successfully");
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Unknown error during load");
      callback?.(true, err.message, err);
      throw err;
    }
  }

  private hydrate(data: CspfShape): void {
    this.setTitle(data.title);
    this.setCreator(data.creator);
    this.setAnnotation(data.annotation);
    this.setInfo(data.info);
    this.setLocation(data.location);
    this.setIdentifier(data.identifier);
    this.setImage(data.image);
    this.setDate(data.date);
    this.setLicense(data.license);
    this.setAttribution(data.attribution);
    this.setLink(data.link);
    this.setMeta(data.meta);
    this.setExtension(data.extension);
    this.setTrack(data.track);
  }
}
