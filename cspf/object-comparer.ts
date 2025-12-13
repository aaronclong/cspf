import { isPlainObject, PlaylistRecord } from "./types-with-validators";

export const arraysEqual = <TItem = unknown>(
  left: TItem[],
  right: TItem[]
): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => valuesEqual(entry, right[index]));
};

export const objectsEqual = (
  left: PlaylistRecord,
  right: PlaylistRecord
): boolean => {
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
