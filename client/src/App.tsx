import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseModule from "@/pages/course-module";
import LiveSessions from "@/pages/live-sessions";
import LiveSessionRoom from "@/pages/live-session-room";
import Community from "@/pages/community";
import CommunityDetail from "@/pages/community-detail";
import Assignments from "@/pages/assignments";
import Certificates from "@/pages/certificates";
import Gamification from "@/pages/gamification";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/:id/modules/:moduleId" component={CourseModule} />
          <Route path="/live-sessions" component={LiveSessions} />
          <Route path="/live-sessions/:id" component={LiveSessionRoom} />
          <Route path="/community" component={Community} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/assignments" component={Assignments} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/gamification" component={Gamification} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
