import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { WidgetConfigPage } from './pages/WidgetConfigPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return <AuthProvider><BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<DashboardLayout />}><Route index element={<DashboardPage />} /><Route path="tickets" element={<TicketsPage />} /><Route path="kb" element={<KnowledgeBasePage />} /><Route path="widget-config" element={<WidgetConfigPage />} /></Route></Route></Routes></BrowserRouter></AuthProvider>;
}

export default App;
