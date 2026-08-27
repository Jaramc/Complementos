import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthProvider';
import { SignalRProvider } from './context/SignalRContext';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { LoginPage } from './pages/LoginPage';
import { TicketsPage } from './pages/TicketsPage';
import { WidgetConfigPage } from './pages/WidgetConfigPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SignalRProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route path="kb" element={<KnowledgeBasePage />} />
                <Route path="widget-config" element={<WidgetConfigPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SignalRProvider>
    </AuthProvider>
  );
}

export default App;
