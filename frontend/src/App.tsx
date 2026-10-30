import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import URLAnalysisPage from './pages/URLAnalysisPage';
import MessageAnalysisPage from './pages/MessageAnalysisPage';
import DeepfakePage from './pages/DeepfakePage';
import TrustVerifyPage from './pages/TrustVerifyPage';

export default function App() {
  return (
    <Routes>
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
