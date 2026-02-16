import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { VerificationPage } from '@/pages/VerificationPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ResultPage } from '@/pages/ResultPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/custom.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/result/:id" element={<ResultPage />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
