import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '\u25C8', end: true },
  { to: '/url', label: 'URL Scanner', icon: '\uD83D\uDD17' },
  { to: '/message', label: 'Message Scanner', icon: '\u2709' },
  { to: '/deepfake', label: 'Deepfake Video', icon: '\uD83C\uDFAC' },
  { to: '/trust', label: 'Trust Verify', icon: '\uD83D\uDD10' },
];

export default function Layout() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const ok = await checkHealth();
      if (mounted) setHealthy(ok);
    };
    check();
    const id = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
              T
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">TrustShield AI</h1>
              <p className="text-xs text-slate-500">Digital Trust Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                healthy === null
                  ? 'bg-slate-500'
                  : healthy
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'bg-red-400'
              }`}
            />
            {healthy === null
              ? 'Checking backend\u2026'
              : healthy
              ? 'Backend connected'
              : 'Backend offline'}
          </div>
          <p className="mt-2 text-slate-600 leading-relaxed">
            Results require human review. No system detects all manipulations.
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-8 py-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <p className="text-sm text-slate-300">
            Unified digital trust investigation platform
          </p>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
