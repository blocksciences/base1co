import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/web3';
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import Staking from "./pages/Staking";
import Auth from "./pages/Auth";
import LaunchICO from "./pages/LaunchICO";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import CreateICO from "./pages/admin/CreateICO";
import ProjectApplications from "./pages/admin/ProjectApplications";
import AdminUsers from "./pages/admin/AdminUsers";
import KYCApprovals from "./pages/admin/KYCApprovals";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminManagement from "./pages/admin/AdminManagement";
import VestingDashboard from "./pages/admin/VestingDashboard";
import LiquidityLocks from "./pages/admin/LiquidityLocks";
import ProjectTransparency from "./pages/ProjectTransparency";
import NotFound from "./pages/NotFound";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
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
              
              {/* Admin Routes - Protected */}
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/projects" element={<AdminProtectedRoute><AdminProjects /></AdminProtectedRoute>} />
              <Route path="/admin/create-ico" element={<AdminProtectedRoute><CreateICO /></AdminProtectedRoute>} />
              <Route path="/admin/applications" element={<AdminProtectedRoute><ProjectApplications /></AdminProtectedRoute>} />
              <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
              <Route path="/admin/kyc" element={<AdminProtectedRoute><KYCApprovals /></AdminProtectedRoute>} />
              <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
              <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminTransactions /></AdminProtectedRoute>} />
              <Route path="/admin/security" element={<AdminProtectedRoute><AdminSecurity /></AdminProtectedRoute>} />
              <Route path="/admin/vesting" element={<AdminProtectedRoute><VestingDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/liquidity-locks" element={<AdminProtectedRoute><LiquidityLocks /></AdminProtectedRoute>} />
              <Route path="/admin/manage-admins" element={<AdminProtectedRoute><AdminManagement /></AdminProtectedRoute>} />
              <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
