import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import AuthPage from './components/Auth/AuthPage';
import HomePage from './pages/Home';
import HistoryPage from './pages/History';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login page — optional, standalone */}
          <Route path="/login" element={<AuthPage />} />

          {/* All main routes are public — wrapped in Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/history"
            element={
              <Layout>
                <HistoryPage />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
