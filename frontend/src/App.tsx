import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MediaScanPage from './pages/MediaScanPage';
import URLAnalysisPage from './pages/URLAnalysisPage';
import MessageAnalysisPage from './pages/MessageAnalysisPage';
import DeepfakePage from './pages/DeepfakePage';
import TrustVerifyPage from './pages/TrustVerifyPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/media" element={<MediaScanPage />} />
        <Route path="/url" element={<URLAnalysisPage />} />
        <Route path="/message" element={<MessageAnalysisPage />} />
        <Route path="/deepfake" element={<DeepfakePage />} />
        <Route path="/trust" element={<TrustVerifyPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}