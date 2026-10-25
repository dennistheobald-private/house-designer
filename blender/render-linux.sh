#!/bin/sh
# Renders House K in Blender (free, from blender.org).
cd "$(dirname "$0")" || exit 1

BLENDER="$(command -v blender)"
for b in "$HOME"/blender*/blender /opt/blender*/blender; do
  [ -z "$BLENDER" ] && [ -x "$b" ] && BLENDER="$b"
done
if [ -z "$BLENDER" ]; then
  echo "Blender is not installed. It is free: https://www.blender.org/download/"
  exit 1
fi

"$BLENDER" --background --python render_house.py -- "$@"
[ -d renders ] && command -v xdg-open >/dev/null && xdg-open renders >/dev/null 2>&1 &
echo "Done. The photos and the video are in the \"renders\" folder."
