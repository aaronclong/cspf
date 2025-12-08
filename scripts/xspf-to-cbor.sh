#!/usr/bin/env bash

set -euo pipefail

command -v yq >/dev/null 2>&1 || {
  echo "Error: yq is not installed or not in PATH." >&2
  exit 1
}

command -v cbor >/dev/null 2>&1 || {
  echo "Error: cbor CLI is not installed or not in PATH." >&2
  exit 1
}

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-xspf> [output.cbor]" >&2
  exit 1
fi

input="$1"
if [[ ! -f "$input" ]]; then
  echo "Error: input file '$input' does not exist." >&2
  exit 1
fi

if [[ $# -ge 2 ]]; then
  output="$2"
else
  base="$(basename "$input")"
  output="${base%.*}.cbor"
fi

yq -o=json -p=xml --xml-attribute-prefix='@' "$input" | cbor import --format=json > "$output"
echo "Wrote $output"
