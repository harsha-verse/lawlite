import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import RoleRoute from "@/components/Layout/RoleRoute";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import LawyerSignup from "./pages/auth/LawyerSignup";
import Dashboard from "./pages/Dashboard";
import Lawyers from "./pages/Lawyers";
import Templates from "./pages/Templates";
import Documents from "./pages/Documents";
import Consultants from "./pages/Consultants";
import StateLegalSupport from "./pages/StateLegalSupport";
import MSMESupport from "./pages/MSMESupport";
import AuthorityFinder from "./pages/AuthorityFinder";
import DocumentGenerator from "./pages/DocumentGenerator";
import LawyerDashboard from "./pages/LawyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LawyerProfileEdit from "./pages/LawyerProfileEdit";
import LawyerPublicProfile from "./pages/LawyerPublicProfile";
import MyCases from "./pages/MyCases";
import CaseDetail from "./pages/CaseDetail";
import SubmitCase from "./pages/SubmitCase";
import BookConsultation from "./pages/BookConsultation";
import MyConsultations from "./pages/MyConsultations";
import SelectLawyer from "./pages/SelectLawyer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import WorkspaceLayout from "./pages/workspace/WorkspaceLayout";
import CasesList from "./pages/workspace/CasesList";
import CaseDetailWorkspace from "./pages/workspace/CaseDetailWorkspace";
import ClientsPage from "./pages/workspace/ClientsPage";
import TasksPage from "./pages/workspace/TasksPage";
import HearingsPage from "./pages/workspace/HearingsPage";
import AuditPage from "./pages/workspace/AuditPage";
import "./i18n";

const queryClient = new QueryClient();

// Public route guard (auth pages). Authenticated users are routed to their own portal.
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();
  if (user) {
    const path = isAdmin
      ? '/admin'
      : profile?.user_type === 'lawyer'
      ? '/lawyer-dashboard'
      : '/dashboard';
    return <Navigate to={path} replace />;
  }
  return <>{children}</>;
};

// Convenience wrappers
const UserOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allow={['user']}>{children}</RoleRoute>
);
const LawyerOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allow={['lawyer']}>{children}</RoleRoute>
);
const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allow={['admin']}>{children}</RoleRoute>
);
const AnyAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allow={['user', 'lawyer', 'admin']}>{children}</RoleRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/lawyer-signup" element={<PublicRoute><LawyerSignup /></PublicRoute>} />

            {/* ===== USER / CLIENT interface (consumer-only) ===== */}
            <Route path="/dashboard" element={<UserOnly><Dashboard /></UserOnly>} />
            <Route path="/lawyers" element={<UserOnly><Lawyers /></UserOnly>} />
            <Route path="/lawyer/:id" element={<UserOnly><LawyerPublicProfile /></UserOnly>} />
            <Route path="/templates" element={<UserOnly><Templates /></UserOnly>} />
            <Route path="/documents" element={<UserOnly><Documents /></UserOnly>} />
            <Route path="/consultants" element={<UserOnly><Consultants /></UserOnly>} />
            <Route path="/state-legal-support" element={<UserOnly><StateLegalSupport /></UserOnly>} />
            <Route path="/msme-support" element={<UserOnly><MSMESupport /></UserOnly>} />
            <Route path="/authority-finder" element={<UserOnly><AuthorityFinder /></UserOnly>} />
            <Route path="/generate-document" element={<UserOnly><DocumentGenerator /></UserOnly>} />
            <Route path="/my-cases" element={<UserOnly><MyCases /></UserOnly>} />
            <Route path="/case/:id" element={<UserOnly><CaseDetail /></UserOnly>} />
            <Route path="/submit-case" element={<UserOnly><SubmitCase /></UserOnly>} />
            <Route path="/case/:caseId/select-lawyer" element={<UserOnly><SelectLawyer /></UserOnly>} />
            <Route path="/book-consultation" element={<UserOnly><BookConsultation /></UserOnly>} />
            <Route path="/my-consultations" element={<UserOnly><MyConsultations /></UserOnly>} />

            {/* Shared: profile available to all authenticated roles */}
            <Route path="/profile" element={<AnyAuth><Profile /></AnyAuth>} />

            {/* ===== LAWYER / ADVOCATE interface (isolated) ===== */}
            <Route path="/lawyer-dashboard" element={<LawyerOnly><LawyerDashboard /></LawyerOnly>} />
            <Route path="/lawyer-profile/edit" element={<LawyerOnly><LawyerProfileEdit /></LawyerOnly>} />
            <Route path="/workspace" element={<LawyerOnly><WorkspaceLayout /></LawyerOnly>}>
              <Route index element={<CasesList />} />
              <Route path="cases/:id" element={<CaseDetailWorkspace />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="hearings" element={<HearingsPage />} />
              <Route path="audit" element={<AuditPage />} />
            </Route>

            {/* ===== ADMIN ===== */}
            <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
