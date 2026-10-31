import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_ORIGIN}/api/v1/auth/register`, { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-100 via-purple-50 to-white relative overflow-hidden flex-col justify-center px-24">
        <div className="z-10 relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
            <div><h1 className="text-2xl font-bold text-slate-900 leading-tight">VeriSafe</h1><p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase">Verify. Trust. Protect.</p></div>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4">Join the Network.<br/><span className="text-purple-600">Start Verifying.</span></h2>
          <p className="text-slate-600 mb-10 max-w-md">Create your account to access deepfake detection, phishing analysis, and cryptographic audits.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8">Start your digital safety journey today.</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Anushka Choudhari" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a strong password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}