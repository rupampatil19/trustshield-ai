import { useState } from 'react';
import type { FormEvent } from 'react';
import { scanDeepfakeVideo } from '../services/api';

interface DeepfakeResult {
  status: string;
  module: string;
  label: string;
  score: number | null;
  score_type?: string;
  video?: {
    width: number;
    height: number;
    fps: number;
    frame_count: number;
    duration_seconds: number;
    codec: string;
    container: string;
  };
  frames_analyzed?: number;
  frames_unscorable?: number;
  frames_failed?: number;
  aggregation?: {
    mean_score: number | null;
    max_score: number | null;
    scored_frames: number;
    unscorable_frames: number;
    failed_frames: number;
    frames_above_threshold: number;
    high_score_ratio: number | null;
    highest_score_timestamp: number | null;
  };
  model?: { name: string; version: string; is_mock: boolean };
  limitations?: string[];
  runtime_seconds?: number;
  error?: string | null;
}

export default function DeepfakePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepfakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await scanDeepfakeVideo(file);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-80" />
        <h1 className="text-2xl font-bold text-white mb-2">Deepfake Video Analysis</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl">
          Upload a video to run the full pipeline: validation \u2192 frame sampling
          \u2192 face detection \u2192 detector inference \u2192 aggregation \u2192 evidence
          generation. The result includes model version and explicit limitations.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-2">
              Video file
            </span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="input-field"
              disabled={loading}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Supported: mp4, mov, avi, mkv, webm \u00B7 Max 100 MB
            </p>
          </label>
          <button
            type="submit"
            disabled={!file || loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running pipeline\u2026
              </>
            ) : (
              'Run Deepfake Pipeline'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-panel p-6 border-red-500/30">
          <h3 className="font-semibold text-red-400 mb-1">Scan failed</h3>
          <p className="text-sm text-slate-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {result.model?.is_mock && (
            <div className="glass-panel p-4 border-amber-500/40 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-xl">\u26A0</span>
                <div>
                  <p className="font-semibold text-amber-400 text-sm">
                    Mock detector in use
                  </p>
                  <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                    This pipeline is running with the original development mock
                    detector. Detection results have no real validity. Integrate
                    production model weights to enable real analysis.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Pipeline Result</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Module: {result.module}
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                {String(result.label).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-800/40 rounded-lg p-3">
                <div className="text-xs text-slate-500">Frames analyzed</div>
                <div className="font-mono text-slate-100 text-lg">
                  {result.frames_analyzed ?? '\u2014'}
                </div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <div className="text-xs text-slate-500">Unscorable</div>
                <div className="font-mono text-slate-100 text-lg">
                  {result.frames_unscorable ?? '\u2014'}
                </div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <div className="text-xs text-slate-500">Mean score</div>
                <div className="font-mono text-slate-100 text-lg">
                  {result.aggregation?.mean_score != null
                    ? result.aggregation.mean_score.toFixed(4)
                    : '\u2014'}
                </div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <div className="text-xs text-slate-500">Runtime</div>
                <div className="font-mono text-slate-100 text-lg">
                  {result.runtime_seconds != null
                    ? result.runtime_seconds.toFixed(2) + 's'
                    : '\u2014'}
                </div>
              </div>
            </div>

            {result.video && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Video metadata
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Resolution:</span>{' '}
                    {result.video.width}\u00D7{result.video.height}
                  </div>
                  <div>
                    <span className="text-slate-500">FPS:</span> {result.video.fps}
                  </div>
                  <div>
                    <span className="text-slate-500">Duration:</span>{' '}
                    {result.video.duration_seconds}s
                  </div>
                  <div>
                    <span className="text-slate-500">Frames:</span>{' '}
                    {result.video.frame_count}
                  </div>
                  <div>
                    <span className="text-slate-500">Codec:</span>{' '}
                    {result.video.codec}
                  </div>
                  <div>
                    <span className="text-slate-500">Container:</span>{' '}
                    {result.video.container}
                  </div>
                </div>
              </div>
            )}

            {result.model && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Detector
                </p>
                <p className="font-mono text-sm text-slate-300">
                  {result.model.name}{' '}
                  <span className="text-slate-500">v{result.model.version}</span>
                  {result.model.is_mock && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      MOCK
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {result.limitations && result.limitations.length > 0 && (
            <div className="glass-panel p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Limitations
              </p>
              <ul className="space-y-1.5 text-sm text-slate-400 list-disc list-inside">
                {result.limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
