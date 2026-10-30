import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import URLAnalysisPage from './pages/URLAnalysisPage';
import MessageAnalysisPage from './pages/MessageAnalysisPage';
import DeepfakePage from './pages/DeepfakePage';
import TrustVerifyPage from './pages/TrustVerifyPage';
import VeriSafeLegacy from './App.verisafe';

export default function App() {
  return (
    <Routes>
      {/* Standalone full-screen legacy route */}
      <Route path="/verisafe" element={<VeriSafeLegacy />} />

      {/* Unified Main App Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/url" element={<URLAnalysisPage />} />
        <Route path="/message" element={<MessageAnalysisPage />} />
        <Route path="/deepfake" element={<DeepfakePage />} />
        <Route path="/trust" element={<TrustVerifyPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}