import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function DashboardPage() {
  const [stats, setStats] = useState({ media: 0, cyber: 0, trust: 0, total: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('ts_token');
        const res = await axios.(${API_ORIGIN}/api/v1/investigations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const scans = Array.isArray(res.data) ? res.data : [];
        setStats({
          media: scans.filter((s: any) => s.module?.includes('Media')).length,
          cyber: scans.filter((s: any) => s.module?.includes('Cyber')).length,
          trust: scans.filter((s: any) => s.module?.includes('Trust')).length,
          total: scans.length
        });
      } catch (err) { 
        console.error("Failed to load stats", err); 
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 rounded-2xl p-10 border border-purple-200 flex items-center justify-between">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[11px] font-bold text-purple-700 mb-6 shadow-sm border border-purple-100 tracking-wider">
            VERIFY. TRUST. PROTECT.
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome back!
          </h1>
          <p className="text-slate-600 mt-4 leading-relaxed text-[15px]">
            Your digital safety companion for a more trustworthy internet. Detect deepfakes, inspect phishing payloads, and audit digital assets in real time.
          </p>
          <div className="flex gap-3 mt-8">
            <Link to="/media" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
              Launch Scanner
            </Link>
            <Link to="/history" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
              View Scan Audit
            </Link>
          </div>
        </div>
        
        {/* Decorative Illustration */}
        <div className="hidden lg:flex items-center justify-center w-64 h-64 relative">
          <div className="absolute inset-0 bg-white opacity-40 rounded-3xl transform rotate-6"></div>
          <div className="absolute inset-0 bg-white opacity-60 rounded-3xl transform -rotate-3"></div>
          <div className="relative z-10 w-48 h-48 bg-white rounded-2xl border-2 border-purple-500 shadow-xl flex items-center justify-center">
            <svg className="w-24 h-24 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/media" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.media}</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">Media Scans</div>
          <div className="text-xs text-slate-500">Deepfake & synthesis forensics</div>
        </Link>

        <Link to="/url" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.cyber}</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">Cyber Scans</div>
          <div className="text-xs text-slate-500">Suspicious links and messages</div>
        </Link>

        <Link to="/trust" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.trust}</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">Trust Checks</div>
          <div className="text-xs text-slate-500">Domain & SSL certificate verification</div>
        </Link>

        <Link to="/history" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">Total Scans</div>
          <div className="text-xs text-slate-500">FastAPI SQLite telemetry records</div>
        </Link>
      </div>
    </div>
  );
}