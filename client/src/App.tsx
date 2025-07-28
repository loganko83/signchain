import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth.tsx";
import Layout from "@/components/Layout";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Documents = lazy(() => import("@/pages/documents"));
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
  return (
    <Layout>
      <Suspense fallback={<PageLoading />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/documents" component={Documents} />
          <Route path="/contract" component={Contract} />
          <Route path="/approval" component={Approval} />
          <Route path="/did" component={DID} />
          <Route path="/verification" component={Verification} />
          <Route path="/security" component={Security} />
          <Route path="/api-docs" component={ApiDocs} />
          <Route path="/sign/:token" component={SignDocument} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
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
