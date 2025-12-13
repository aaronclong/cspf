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

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
output_dir="$repo_root/cspf/__tests__/resources"

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
  mkdir -p "$output_dir"
  output="$output_dir/${base%.*}.cspf"
fi

yq -o=json -p=xml --xml-attribute-prefix='@' "$input" | cbor import --format=json > "$output"
echo "Wrote $output"
