import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHealthDetail } from '../services/api';

const MODULES = [
  {
    to: '/url',
    icon: '\uD83D\uDD17',
    title: 'URL Scanner',
    desc: 'Analyse a URL for phishing indicators using rule-based heuristics and threat-intelligence feeds.',
    tag: 'Cyber Resilience',
  },
  {
    to: '/message',
    icon: '\u2709',
    title: 'Message Scanner',
    desc: 'Analyse suspicious SMS, email or chat text. Embedded URLs are extracted and scanned individually.',
    tag: 'Cyber Resilience',
  },
  {
    to: '/deepfake',
    icon: '\uD83C\uDFAC',
    title: 'Deepfake Video',
    desc: 'Run the video pipeline: validation &rarr; frame sampling &rarr; face detection &rarr; detector inference &rarr; aggregation.',
    tag: 'Deepfake Detection',
  },
  {
    to: '/trust',
    icon: '\uD83D\uDD10',
    title: 'Trust Verify',
    desc: 'Compute SHA-256 file integrity hashes and compare two files for byte-level equality.',
    tag: 'Digital Trust',
  },
];

interface Health {
  status?: string;
  version?: string;
  components?: string[];
}

export default function DashboardPage() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    getHealthDetail()
      .then((h) => setHealth(h))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome to TrustShield AI</h1>
        <p className="text-slate-400 mt-2 max-w-3xl leading-relaxed">
          One investigation platform combining deepfake detection, phishing analysis,
          and digital trust verification. Every result includes explicit limitations
          and is designed to support &mdash; not replace &mdash; human judgement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="glass-panel p-6 hover:border-cyan-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="text-3xl">{m.icon}</div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-500/70 font-mono">
                {m.tag}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-3 group-hover:text-cyan-400 transition-colors">
              {m.title}
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
            <p className="text-xs text-cyan-500 mt-4 font-medium">Open &rarr;</p>
          </Link>
        ))}
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Backend Status
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              health
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            {health ? 'ONLINE' : 'UNREACHABLE'}
          </span>
        </div>
        {health ? (
          <div className="space-y-2 text-sm">
            <p className="text-slate-400">
              Version: <span className="font-mono text-slate-300">{health.version}</span>
            </p>
            <p className="text-slate-400">
              Components:{' '}
              {health.components?.map((c) => (
                <span
                  key={c}
                  className="inline-block mr-2 px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300"
                >
                  {c}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Start the backend with <code className="font-mono">uvicorn app.main:app</code>{' '}
            to enable live scanning.
          </p>
        )}
      </div>

      <div className="glass-panel p-6 border-amber-500/20">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
          Responsible AI Notice
        </h3>
        <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            No result is a guarantee of authenticity or safety &mdash; false positives
            and false negatives are possible.
          </li>
          <li>
            Deepfake pipeline currently runs with a labelled mock detector pending
            production model weights.
          </li>
          <li>
            Absence of C2PA Content Credentials does not mean a file is fake.
          </li>
          <li>Every response includes explicit limitations and suggests human review.</li>
        </ul>
      </div>
    </div>
  );
}