HOUSE K - PHOTO-REALISTIC RENDER
================================

This folder holds the furnished house from the House Designer app and everything
Blender needs to render it photo-realistically. Nothing needs editing.

1. Install Blender once. It is free: https://www.blender.org/download/
   (version 4.2 or newer).
2. Double-click the starter for your computer:
     Windows:  "Render on Windows.bat"
     Mac:      "Render on Mac.command"
               (the first time, macOS may refuse a file from the internet:
               right-click it, choose Open, then Open again)
     Linux:    render-linux.sh
3. A window shows the progress. When it is done, the "renders" folder opens:
     renders/photos/          a photo of every room (and of the view you exported)
     renders/<name>.mp4       the video: the room tour or the walk you recorded
     renders/video-frames/    the single frames of the video

If it is interrupted (the computer sleeps, the window is closed), double-click the
starter again: finished photos and frames are kept and it carries on.

How long it takes depends mostly on the graphics card. Blender uses it by itself
(NVIDIA, AMD, Apple or Intel); without one it renders on the processor, which is
much slower. As a guide, with a recent mid-range graphics card:
  Quick preview:  a photo takes about 10-30 seconds, a video frame 1-3 seconds.
  Final:          a photo takes about 1-3 minutes, a video frame 5-15 seconds.
A 60-second video has 1500 frames, so a final video can run for some hours:
start it in the evening and it is ready in the morning.

For a quicker look, or only one part, the starters take options (from a terminal):
  --quality preview      lower resolution and fewer samples
  --quality final        full HD, clean
  --only photos          only the photos
  --only video           only the video

The scene folder holds the model (house.glb, glTF) and the camera work (job.json);
house.glb also opens in other programs, such as Unreal Engine or SketchUp.
