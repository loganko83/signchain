import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth.tsx";
import { ProtectedRoute } from "./components/LoginForm";
import Layout from "@/components/Layout";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Documents = lazy(() => import("@/pages/documents"));
const Files = lazy(() => import("@/pages/files"));
const Contract = lazy(() => import("@/pages/contract"));
const Approval = lazy(() => import("@/pages/approval"));
const DID = lazy(() => import("@/pages/did"));
const Verification = lazy(() => import("@/pages/verification"));
const Security = lazy(() => import("@/pages/security"));
const ApiDocs = lazy(() => import("@/pages/api-docs"));
const SignDocument = lazy(() => import("@/pages/sign-document"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  // Base path 설정 - 프로덕션에서는 /signchain/, 개발에서는 /
  const basePath = import.meta.env.PROD ? '/signchain' : '';
  
  return (
    <WouterRouter base={basePath}>
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/documents">
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            </Route>
            <Route path="/files">
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            </Route>
            <Route path="/contract">
              <ProtectedRoute>
                <Contract />
              </ProtectedRoute>
            </Route>
            <Route path="/approval">
              <ProtectedRoute>
                <Approval />
              </ProtectedRoute>
            </Route>
            <Route path="/did">
              <ProtectedRoute>
                <DID />
              </ProtectedRoute>
            </Route>
            <Route path="/verification" component={Verification} />
            <Route path="/security">
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            </Route>
            <Route path="/api-docs" component={ApiDocs} />
            <Route path="/sign/:token" component={SignDocument} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Layout>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
