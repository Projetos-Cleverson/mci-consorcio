import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';

const Landing = lazy(() => import('@/pages/Landing'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const LeadCapture = lazy(() => import('@/pages/LeadCapture'));
const Result = lazy(() => import('@/pages/Result'));
const CompanyApplication = lazy(() => import('@/pages/CompanyApplication'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminLeads = lazy(() => import('@/pages/admin/Leads'));
const AdminLeadDetail = lazy(() => import('@/pages/admin/LeadDetail'));
const AdminKanban = lazy(() => import('@/pages/admin/Kanban'));
const AdminPartners = lazy(() => import('@/pages/admin/Partners'));
const AdminReports = lazy(() => import('@/pages/admin/Reports'));
const AdminLeadReport = lazy(() => import('@/pages/admin/LeadReport'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--light-gray)]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 border-3 border-[var(--deep-blue)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-muted)] font-sans">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/p/:partnerSlug" element={<Landing />} />
          <Route path="/diagnostico" element={<Quiz />} />
          <Route path="/dados" element={<LeadCapture />} />
          <Route path="/resultado" element={<Result />} />
          <Route path="/empresas/cadastro" element={<CompanyApplication />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/leads/:id" element={<AdminLeadDetail />} />
          <Route path="/admin/leads/:id/relatorio" element={<AdminLeadReport />} />
          <Route path="/admin/kanban" element={<AdminKanban />} />
          <Route path="/admin/parceiros" element={<AdminPartners />} />
          <Route path="/admin/relatorios" element={<AdminReports />} />
          
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
