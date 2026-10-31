import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MediaScanPage from './pages/MediaScanPage';
import URLAnalysisPage from './pages/URLAnalysisPage';
import MessageAnalysisPage from './pages/MessageAnalysisPage';
import DeepfakePage from './pages/DeepfakePage';
import TrustVerifyPage from './pages/TrustVerifyPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/media" element={<MediaScanPage />} />
            <Route path="/url" element={<URLAnalysisPage />} />
            <Route path="/message" element={<MessageAnalysisPage />} />
            <Route path="/deepfake" element={<DeepfakePage />} />
            <Route path="/trust" element={<TrustVerifyPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}