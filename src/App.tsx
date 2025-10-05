import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider, useAccount } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/web3';
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { LoadingScreen } from "./components/LoadingScreen";
import { AdminLoadingSkeleton } from "./components/AdminLoadingSkeleton";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { ErrorTracker } from "./components/ErrorTracker";
import { SEO } from "./components/SEO";
import { MobileOptimized } from "./components/MobileOptimized";

// Eagerly loaded routes (public pages)
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import Staking from "./pages/Staking";
import Auth from "./pages/Auth";
import LaunchICO from "./pages/LaunchICO";
import ProjectTransparency from "./pages/ProjectTransparency";
import Referrals from "./pages/Referrals";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

// Lazy loaded admin routes (reduces initial bundle by ~60%)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const CreateICO = lazy(() => import("./pages/admin/CreateICO"));
const ProjectApplications = lazy(() => import("./pages/admin/ProjectApplications"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const KYCApprovals = lazy(() => import("./pages/admin/KYCApprovals"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement"));
const VestingDashboard = lazy(() => import("./pages/admin/VestingDashboard"));
const LiquidityLocks = lazy(() => import("./pages/admin/LiquidityLocks"));
const EntityKYC = lazy(() => import("./pages/admin/EntityKYC"));
const DistributionJobs = lazy(() => import("./pages/admin/DistributionJobs"));
const QuickKYCApproval = lazy(() => import("./pages/admin/QuickKYCApproval"));
const DeployListToken = lazy(() => import("./pages/admin/DeployListToken"));
const AIKYCDemo = lazy(() => import("./pages/admin/AIKYCDemo"));

const queryClient = new QueryClient();

const AppContent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isConnecting } = useAccount();

  useEffect(() => {
    // Give Web3 providers time to initialize
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized || isConnecting) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ErrorTracker />
      <SEO />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/transparency" element={<ProjectTransparency />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/launch" element={<LaunchICO />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/analytics" element={<Analytics />} />
          
          {/* Admin Routes - Protected & Lazy Loaded */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminDashboard />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/projects" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminProjects />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/create-ico" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <CreateICO />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <ProjectApplications />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminUsers />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/kyc" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <KYCApprovals />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminAnalytics />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/transactions" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminTransactions />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/security" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminSecurity />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/vesting" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <VestingDashboard />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/liquidity-locks" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <LiquidityLocks />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/entity-kyc" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <EntityKYC />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/distributions" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <DistributionJobs />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/quick-kyc" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <QuickKYCApproval />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/manage-admins" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminManagement />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AdminSettings />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/deploy-list-token" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <DeployListToken />
              </Suspense>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/ai-kyc-demo" element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminLoadingSkeleton />}>
                <AIKYCDemo />
              </Suspense>
            </AdminProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: 'hsl(191, 100%, 50%)',
            accentColorForeground: 'hsl(222, 47%, 5%)',
            borderRadius: 'large',
          })}
        >
          <TooltipProvider>
            <MobileOptimized>
              <AppContent />
            </MobileOptimized>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ErrorBoundary>
);

export default App;
