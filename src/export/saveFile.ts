/*
 * Hands a generated file to the viewer. Inside a claude.ai artifact the page may not start a
 * download itself, so it asks the artifact's `downloads` capability, which shows the viewer a
 * confirmation; anywhere else a plain browser download does.
 */

interface Downloads {
  save(request: { filename: string; data: Blob }): Promise<{ status: 'saved' | 'delivered' }>;
}

type ClaudeRuntime = { use(name: 'downloads'): Promise<Downloads | null> };

/** Resolves 'saved', or 'declined' when the viewer said no to the artifact's prompt. */
export async function saveFile(filename: string, data: Blob): Promise<'saved' | 'declined'> {
  const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude;
  const downloads = runtime?.use ? await runtime.use('downloads').catch(() => null) : null;
  if (downloads) {
    try {
      await downloads.save({ filename, data });
      return 'saved';
    } catch (err) {
      if ((err as { code?: string }).code === 'declined') return 'declined';
      throw new Error((err as { message?: string }).message ?? 'The download was refused.');
    }
  }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'saved';
}
