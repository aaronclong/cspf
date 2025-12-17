import { readFile } from "node:fs";

import { encode } from "@ipld/dag-cbor";
import { describe, expect, test, vi } from "vitest";
import { XMLParser } from "fast-xml-parser";

import { Cspf, Track } from "../metadata-dtos";
import { type PlaylistRecord, type TrackShape } from "../types-with-validators";
import {
  getPlaylistFieldValue,
  getTrackFieldValue,
  playlistMetadataFields,
  trackFields,
} from "./test-utils";

const createTrackShape = (overrides: Partial<TrackShape> = {}): TrackShape => ({
  location: "loc",
  identifier: "id",
  title: "title",
  creator: "creator",
  annotation: "annotation",
  info: "info",
  image: "image",
  album: "album",
  trackNum: 1,
  duration: 100,
  link: [],
  meta: [],
  extension: {},
  ...overrides,
});

const testFileLoader = (file: string): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

describe("Track", () => {
  test("initializes with defaults and exposes type guards", () => {
    const track = new Track();
    expect(track.location).toBe("");
    expect(track.identifier).toBe("");
    expect(track.trackNum).toBe(0);
    expect(track.duration).toBe(0);
    expect(track.link).toEqual([]);
    expect(track.meta).toEqual([]);
    expect(track.extension).toEqual({});
    expect(track.isTrack(track)).toBe(true);
    const parsed = JSON.parse(track.toString());
    expect(track.parsable(parsed)).toBe(true);
  });

  test("accepts valid setter input and rejects invalid data", () => {
    const track = new Track();
    expect(track.setLocation("wherever")).toBe(true);
    expect(track.getLocation()).toBe("wherever");
    expect(track.setLocation(42 as unknown as string)).toBe(false);

    expect(track.setIdentifier("identifier")).toBe(true);
    expect(track.getIdentifier()).toBe("identifier");
    expect(track.setIdentifier({} as string)).toBe(false);

    expect(track.setTitle("title")).toBe(true);
    expect(track.setCreator("creator")).toBe(true);
    expect(track.setAnnotation("annotation")).toBe(true);
    expect(track.setInfo("info")).toBe(true);
    expect(track.setImage("image")).toBe(true);
    expect(track.setAlbum("album")).toBe(true);
    expect(track.setTrackNum(5)).toBe(true);
    expect(track.setTrackNum("nope" as unknown as number)).toBe(false);
    expect(track.setDuration(120)).toBe(true);
    expect(track.setDuration(Number.NaN)).toBe(false);

    const link: PlaylistRecord[] = [{ foo: "bar" }];
    expect(track.setLink(link)).toBe(true);
    expect(track.getLink()).toEqual(link);
    expect(track.setLink("nope" as unknown as PlaylistRecord[])).toBe(false);

    const meta: PlaylistRecord[] = [{ fizz: "buzz" }];
    expect(track.setMeta(meta)).toBe(true);
    expect(track.getMeta()).toEqual(meta);
    expect(track.setMeta("nope" as unknown as PlaylistRecord[])).toBe(false);

    const extension = { ext: "value" } satisfies PlaylistRecord;
    expect(track.setExtension(extension)).toBe(true);
    expect(track.getExtension()).toEqual(extension);
    expect(track.setExtension("nope" as unknown as PlaylistRecord)).toBe(false);
  });

  test("compares and parses track payloads", () => {
    const shape = createTrackShape({ trackNum: 10 });
    const a = new Track(shape);
    const b = new Track(shape);
    expect(a.compare(b)).toBe(true);
    b.setTitle("other");
    expect(a.compare(b)).toBe(false);

    const serialized = a.toString();
    expect(Track.isParsable(JSON.parse(serialized))).toBe(true);
  });

  test("creates tracks from shapes and rejects invalid payloads", () => {
    const shape = createTrackShape();
    const converted = Track.from(shape);
    expect(converted).toBeInstanceOf(Track);
    expect(converted.compare(new Track(shape))).toBe(true);
    expect(Track.from({})).toBeInstanceOf(Track);
    expect(() =>
      Track.from({ location: 123 } as unknown as TrackShape)
    ).toThrowError(/parsable/);
  });
});

describe("Cspf", () => {
  test("manages playlist level metadata", () => {
    const playlist = new Cspf();
    expect(playlist.isCspf(playlist)).toBe(true);
    expect(playlist.setTitle("My Playlist")).toBe(true);
    expect(playlist.getTitle()).toBe("My Playlist");
    expect(playlist.setCreator("Author")).toBe(true);
    expect(playlist.setAnnotation("Notes")).toBe(true);
    expect(playlist.setInfo("Info")).toBe(true);
    expect(playlist.setLocation("https://example.com")).toBe(true);
    expect(playlist.setIdentifier("playlist-id")).toBe(true);
    expect(playlist.setImage("image.png")).toBe(true);
    expect(playlist.setDate("2024-01-01")).toBe(true);
    expect(playlist.setLicense("MIT")).toBe(true);
    expect(playlist.setAttribution([{ role: "dj" }])).toBe(true);
    expect(playlist.setLink([{ rel: "alternate" }])).toBe(true);
    expect(playlist.setMeta([{ name: "genre", value: "rock" }])).toBe(true);
    expect(playlist.setExtension({ foo: "bar" })).toBe(true);

    const serialized = playlist.toString();
    expect(serialized).toContain("My Playlist");
    expect(playlist.parsable(JSON.parse(serialized))).toBe(true);
  });

  test("manages track collections with validation helpers", () => {
    const playlist = new Cspf({ track: [createTrackShape()] });
    expect(playlist.getTrack()).toHaveLength(1);
    expect(playlist.getTrackById(0)?.title).toBe("title");
    expect(playlist.getTrackById(10)).toBeUndefined();

    expect(playlist.isTrack([new Track()])).toBe(true);
    expect(playlist.isTrack([{}])).toBe(true);
    expect(playlist.isTrack([42 as unknown as TrackShape])).toBe(false);
    expect(playlist.isParsableTrack([createTrackShape()])).toBe(true);
    expect(playlist.isParsableTrack([{}])).toBe(true);
    expect(playlist.isParsableTrack(["nope" as unknown as TrackShape])).toBe(
      false
    );

    const pushCandidate = new Track(createTrackShape({ title: "two" }));
    expect(playlist.pushTrack(pushCandidate)).toBe(true);
    expect(playlist.getTrack()).toHaveLength(2);
    expect(playlist.pushTrack({} as TrackShape)).toBe(true);
    expect(playlist.getTrack()).toHaveLength(3);
    expect(playlist.pushTrack({ location: 123 } as unknown as TrackShape)).toBe(
      false
    );

    expect(playlist.addTrack("loc", "identifier", "third")).toBe(true);
    expect(playlist.getTrack()).toHaveLength(4);

    expect(playlist.removeTrack(pushCandidate)).toBe(true);
    expect(playlist.removeTrack(pushCandidate)).toBe(false);

    expect(playlist.setTrack([createTrackShape({ title: "reset" })])).toBe(
      true
    );
    expect(playlist.getTrack()).toHaveLength(1);
    expect(playlist.setTrack(["nope" as unknown as Track])).toBe(false);
  });

  test("updates track fields by index", () => {
    const playlist = new Cspf({ track: [createTrackShape()] });

    expect(playlist.setTrackLocation(0, "updated")).toBe(true);
    expect(playlist.getTrack()[0].getLocation()).toBe("updated");
    expect(playlist.setTrackIdentifier(0, "new-id")).toBe(true);
    expect(playlist.setTrackTitle(0, "new title")).toBe(true);
    expect(playlist.setTrackCreator(0, "new creator")).toBe(true);
    expect(playlist.setTrackAnnotation(0, "notes")).toBe(true);
    expect(playlist.setTrackInfo(0, "info")).toBe(true);
    expect(playlist.setTrackImage(0, "image")).toBe(true);
    expect(playlist.setTrackAlbum(0, "album")).toBe(true);
    expect(playlist.setTrackTrackNum(0, 10)).toBe(true);
    expect(playlist.setTrackDuration(0, 120)).toBe(true);
    expect(playlist.setTrackLink(0, [{ rel: "preview" }])).toBe(true);
    expect(playlist.setTrackMeta(0, [{ foo: "bar" }])).toBe(true);
    expect(playlist.setTrackExtension(0, { ext: true })).toBe(true);

    expect(playlist.setTrackLocation(5, "missing")).toBe(false);
  });

  test("serializes to bytes and loads from bytes with callbacks", () => {
    const playlist = new Cspf({
      title: "Encoded",
      track: [createTrackShape({ title: "encoded track" })],
    });
    const bytes = playlist.toBytes();
    expect(bytes).toBeInstanceOf(Uint8Array);

    const success = vi.fn();
    const clone = Cspf.loadFromBytes(bytes, success);
    expect(success).toHaveBeenCalledWith(false, "Playlist loaded successfully");
    expect(clone.getTitle()).toBe("Encoded");
    expect(clone.getTrack()).toHaveLength(1);

    const failure = vi.fn();
    const badPayload = encode<unknown>({ track: null });
    expect(() => Cspf.loadFromBytes(badPayload, failure)).toThrowError(
      /not a CSPF playlist/
    );
    expect(failure).toHaveBeenCalled();
    expect(failure.mock.calls[0][0]).toBe(true);
  });
});

describe("Round Trip", () => {
  test("Can load DeepHouse2025.cspf when generated locally", async () => {
    // { skip: !process.env.CI },

    const fileBytes = await testFileLoader(
      "./cspf/__tests__/resources/DeepHouse2025.cspf"
    );

    const playlist = Cspf.loadFromBytes(fileBytes);

    expect(playlist.getTrack().length).toBeGreaterThan(0);
  });

  test("DeepHouse2025.cspf matches DeepHouse2025.cspf when generated locally", async () => {
    const [cspfBytes, xspfBytes] = await Promise.all([
      testFileLoader("./cspf/__tests__/resources/DeepHouse2025.cspf"),
      testFileLoader("./cspf/__tests__/resources/DeepHouse2025.xspf"),
    ]);

    const playlistDocument = new XMLParser().parse(
      Buffer.from(xspfBytes).toString("utf8")
    );
    const loadedCspf = Cspf.loadFromBytes(cspfBytes);

    const playlistNode = playlistDocument.playlist ?? {};

    for (const field of playlistMetadataFields) {
      const xspfValue = playlistNode[field];
      if (xspfValue === undefined) continue;

      expect(getPlaylistFieldValue(loadedCspf, field)).toEqual(xspfValue);
    }

    const trackEntries = playlistNode.trackList?.track;
    const xspfTracks = Array.isArray(trackEntries)
      ? trackEntries
      : trackEntries
      ? [trackEntries]
      : [];

    const cspfTracks = loadedCspf.getTrack();
    expect(cspfTracks).toHaveLength(xspfTracks.length);

    for (let index = 0; index < xspfTracks.length; index += 1) {
      const xspfTrack = xspfTracks[index] as TrackShape;
      const cspfTrack = cspfTracks[index];

      for (const field of trackFields) {
        const xspfValue = xspfTrack[field];
        if (xspfValue === undefined) continue;

        expect(getTrackFieldValue(cspfTrack, field)).toEqual(xspfValue);
      }
    }
  });
});
