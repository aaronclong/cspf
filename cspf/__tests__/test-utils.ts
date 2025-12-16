import { Cspf, Track } from "../metadata-dtos";

export const playlistMetadataFields = [
  "title",
  "creator",
  "annotation",
  "info",
  "location",
  "identifier",
  "image",
  "date",
  "license",
  "attribution",
  "link",
  "meta",
  "extension",
] as const;

export type PlaylistMetadataField = (typeof playlistMetadataFields)[number];

export const trackFields = Object.freeze([
  "location",
  "identifier",
  "title",
  "creator",
  "annotation",
  "info",
  "image",
  "album",
  "trackNum",
  "duration",
  "link",
  "meta",
  "extension",
] as const);

export type TrackField = (typeof trackFields)[number];

export const getPlaylistFieldValue = (
  playlist: Cspf,
  field: PlaylistMetadataField
): unknown => {
  switch (field) {
    case "title":
      return playlist.getTitle();
    case "creator":
      return playlist.getCreator();
    case "annotation":
      return playlist.getAnnotation();
    case "info":
      return playlist.getInfo();
    case "location":
      return playlist.getLocation();
    case "identifier":
      return playlist.getIdentifier();
    case "image":
      return playlist.getImage();
    case "date":
      return playlist.getDate();
    case "license":
      return playlist.getLicense();
    case "attribution":
      return playlist.getAttribution();
    case "link":
      return playlist.getLink();
    case "meta":
      return playlist.getMeta();
    case "extension":
      return playlist.getExtension();
    default:
      return undefined;
  }
};

export const getTrackFieldValue = (
  track: Track,
  field: TrackField
): unknown => {
  switch (field) {
    case "location":
      return track.getLocation();
    case "identifier":
      return track.getIdentifier();
    case "title":
      return track.getTitle();
    case "creator":
      return track.getCreator();
    case "annotation":
      return track.getAnnotation();
    case "info":
      return track.getInfo();
    case "image":
      return track.getImage();
    case "album":
      return track.getAlbum();
    case "trackNum":
      return track.getTrackNum();
    case "duration":
      return track.getDuration();
    case "link":
      return track.getLink();
    case "meta":
      return track.getMeta();
    case "extension":
      return track.getExtension();
    default:
      return undefined;
  }
};
