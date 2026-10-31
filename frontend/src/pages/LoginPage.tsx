import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function LoginPage() {
  const [email, setEmail] = useState('anushka@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_ORIGIN}/api/v1/auth/login`, { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-100 via-purple-50 to-white relative overflow-hidden flex-col justify-center px-24">
        <div className="z-10 relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">VeriSafe</h1>
              <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase">Verify. Trust. Protect.</p>
            </div>
          </div>

          <div className="inline-block bg-white px-4 py-1.5 rounded-full text-xs font-bold text-purple-700 mb-6 shadow-sm border border-purple-100">Ã°Å¸â€ºÂ¡Ã¯Â¸Â NEXT-GENERATION DIGITAL TRUST</div>
          <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4">Verify Every Pixel.<br/><span className="text-purple-600">Protect Digital Truth.</span></h2>
          <p className="text-slate-600 mb-10 max-w-md">Your digital world is full of information. We help you verify what's real. VeriSafe combines neural deepfake detection, forensic URL scanning, and cryptographic trust verification to protect your media interactions.</p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3"><span className="text-purple-500 mt-1">Ã°Å¸â€“Â¼Ã¯Â¸Â</span><div><h4 className="text-sm font-bold text-slate-900">Media Analysis</h4><p className="text-xs text-slate-500">Deepfake & synthesis detection</p></div></div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3"><span className="text-purple-500 mt-1">Ã°Å¸Å’Â</span><div><h4 className="text-sm font-bold text-slate-900">URL Scanning</h4><p className="text-xs text-slate-500">Zero-day phishing heuristics</p></div></div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3"><span className="text-purple-500 mt-1">Ã°Å¸â€ºÂ¡Ã¯Â¸Â</span><div><h4 className="text-sm font-bold text-slate-900">Cyber Checks</h4><p className="text-xs text-slate-500">Payload & message triage</p></div></div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3"><span className="text-purple-500 mt-1">Ã°Å¸â€â€”</span><div><h4 className="text-sm font-bold text-slate-900">Trust Verification</h4><p className="text-xs text-slate-500">DNSSEC & cryptographic audits</p></div></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6"><svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Sign in to continue protecting your digital world.</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Ã¢Å“â€°Ã¯Â¸Â</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" required />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-purple-600 hover:text-purple-700">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Ã°Å¸â€â€™</span>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your security password" className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">Ã°Å¸â€˜ÂÃ¯Â¸Â</span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-sm text-slate-600">Remember me on this trusted device</span>
            </label>

            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
              {loading ? 'Authenticating...' : 'Ã°Å¸â€â€™ Log in securely'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            New to VeriSafe? <Link to="/register" className="font-bold text-purple-600 hover:text-purple-700">Create an account.</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Instant Demo Accounts:</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEmail('anushka@example.com'); setPassword('password123'); }} className="flex-1 bg-slate-50 border border-slate-200 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition text-left px-3 flex justify-between items-center">Anushka <span>Ã¢â€ â€™</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}