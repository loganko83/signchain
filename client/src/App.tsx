import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth.tsx";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Contract from "@/pages/contract";
import Approval from "@/pages/approval";
import DID from "@/pages/did";
import Verification from "@/pages/verification";
import Security from "@/pages/security";
import ApiDocs from "@/pages/api-docs";
import SignDocument from "@/pages/sign-document";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
