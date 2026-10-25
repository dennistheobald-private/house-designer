#!/bin/bash
# Renders House K in Blender (free, from blender.org). Double-click to start.
cd "$(dirname "$0")" || exit 1

BLENDER=""
for app in /Applications/Blender*.app "$HOME"/Applications/Blender*.app; do
  [ -x "$app/Contents/MacOS/Blender" ] && BLENDER="$app/Contents/MacOS/Blender"
done
[ -z "$BLENDER" ] && command -v blender >/dev/null && BLENDER="$(command -v blender)"

if [ -z "$BLENDER" ]; then
  echo "Blender is not installed yet. It is free: the download page opens now."
  echo "Install it, then double-click \"Render on Mac\" again."
  open "https://www.blender.org/download/"
  read -r -p "Press Return to close."
  exit 1
fi

echo "Rendering with $BLENDER"
echo "This window shows the progress. Leave it open; it can take a while."
echo
"$BLENDER" --background --python render_house.py -- "$@"
echo
[ -d renders ] && open renders
echo "Done. The photos and the video are in the \"renders\" folder."
