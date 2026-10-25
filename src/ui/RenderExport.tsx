import { useEffect, useState, useSyncExternalStore } from 'react';
import type { House } from '../house/types';
import type { TimeOfDay } from '../scene/Scene';
import { downloadRenderPackage, type RenderQuality } from '../export/blenderPackage';
import { isRecording, MAX_SECONDS, onRecordingChange, recordedSeconds, recordedWalk, startRecording, stopRecording } from '../export/walkRecording';

const useRecording = () => useSyncExternalStore(onRecordingChange, isRecording);

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Record or stop the walk, for a video that follows your own route. */
export function RecordWalkButton() {
  const recording = useRecording();
  const [, tick] = useState(0);
  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [recording]);
  return (
    <button
      className={`record-button${recording ? ' active' : ''}`}
      onClick={(e) => {
        // Hand the keys back to walking.
        e.currentTarget.blur();
        recording ? stopRecording() : startRecording();
      }}
      title={`Record your walk for a video rendered in Blender (up to ${MAX_SECONDS / 60} minutes)`}
    >
      {recording ? `■ Stop ${clock(recordedSeconds())}` : '● Record walk'}
    </button>
  );
}

/**
 * Packs the furnished house for Blender: a photo of every room and a video, rendered
 * photo-realistically on your own computer by a double-click, with nothing to edit there.
 */
export function RenderExport({ house, time, furnished, currentView, onClose }: { house: House; time: TimeOfDay; furnished: boolean; currentView: { hide: string[] } | null; onClose: () => void }) {
  const recording = useRecording();
  const walkSeconds = recording ? 0 : recordedSeconds();
  const [light, setLight] = useState<TimeOfDay>(time);
  const [quality, setQuality] = useState<RenderQuality>('final');
  const [photos, setPhotos] = useState(true);
  const [withCurrent, setWithCurrent] = useState(currentView !== null);
  const [video, setVideo] = useState<'tour' | 'walk' | 'none'>(walkSeconds > 1 ? 'walk' : 'tour');
  const [state, setState] = useState<{ busy: boolean; result?: string; error?: string }>({ busy: false });

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.code === 'Escape' && !state.busy && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, state.busy]);

  const nothing = !photos && !(withCurrent && currentView) && video === 'none';

  const start = async () => {
    setState({ busy: true });
    // Let the "packing" note paint before the export holds the page for a few seconds.
    await new Promise((r) => setTimeout(r, 50));
    try {
      const r = await downloadRenderPackage(house, {
        time: light,
        furnished,
        quality,
        stills: photos,
        currentView: withCurrent ? currentView : null,
        video,
        walk: recordedWalk(),
      });
      const parts = [r.stills ? `${r.stills} photos` : '', r.frames ? `a ${clock(r.frames / 25)} video` : ''].filter(Boolean).join(' and ');
      if (r.saved === 'declined') {
        setState({ busy: false, error: 'The download was cancelled. Click Download for Blender to try again.' });
        return;
      }
      setState({ busy: false, result: `Downloaded (${(r.bytes / 1e6).toFixed(0)} MB): ${parts}. Unzip it and double-click the starter for your computer.` });
    } catch (err) {
      console.error(err);
      setState({ busy: false, error: `The export failed: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  return (
    <div className="dialog-backdrop" onClick={() => !state.busy && onClose()}>
      <div className="dialog" role="dialog" aria-label="Render in Blender" onClick={(e) => e.stopPropagation()}>
        <h2>Render in Blender</h2>
        <p className="dialog-note">
          Downloads the furnished house with its camera work for Blender, the free 3D program. Unzip it and double-click the starter: Blender renders
          photo-realistic photos and a video by itself, with nothing to set up there.
        </p>

        <fieldset>
          <legend>Photos</legend>
          <label>
            <input type="checkbox" checked={photos} onChange={(e) => setPhotos(e.target.checked)} /> Every room, from its best viewpoint
          </label>
          <label className={currentView ? '' : 'disabled'}>
            <input type="checkbox" checked={withCurrent && currentView !== null} disabled={!currentView} onChange={(e) => setWithCurrent(e.target.checked)} /> The view on screen now
          </label>
        </fieldset>

        <fieldset>
          <legend>Video</legend>
          <label>
            <input type="radio" name="video" checked={video === 'tour'} onChange={() => setVideo('tour')} /> Room tour: a slow pan through every room
          </label>
          <label className={walkSeconds > 1 ? '' : 'disabled'}>
            <input type="radio" name="video" checked={video === 'walk'} disabled={walkSeconds <= 1} onChange={() => setVideo('walk')} />{' '}
            {walkSeconds > 1 ? `My recorded walk (${clock(walkSeconds)})` : recording ? 'My recorded walk (stop the recording first)' : 'My recorded walk (record one in Walk first)'}
          </label>
          <label>
            <input type="radio" name="video" checked={video === 'none'} onChange={() => setVideo('none')} /> No video
          </label>
        </fieldset>

        <fieldset className="dialog-row">
          <legend>Light and quality</legend>
          <nav className="tabs" aria-label="Light">
            <button className={light === 'day' ? 'active' : ''} onClick={() => setLight('day')}>
              Day
            </button>
            <button className={light === 'evening' ? 'active' : ''} onClick={() => setLight('evening')}>
              Evening
            </button>
          </nav>
          <nav className="tabs" aria-label="Quality">
            <button className={quality === 'preview' ? 'active' : ''} onClick={() => setQuality('preview')} title="Lower resolution, quick to render">
              Quick preview
            </button>
            <button className={quality === 'final' ? 'active' : ''} onClick={() => setQuality('final')} title="Full HD and clean; takes longer">
              Final
            </button>
          </nav>
        </fieldset>

        {state.result && <p className="dialog-result">{state.result}</p>}
        {state.error && <p className="dialog-error">{state.error}</p>}

        <div className="dialog-actions">
          <button onClick={onClose} disabled={state.busy}>
            Close
          </button>
          <button className="primary" onClick={start} disabled={state.busy || nothing}>
            {state.busy ? 'Packing the house…' : 'Download for Blender'}
          </button>
        </div>
      </div>
    </div>
  );
}
