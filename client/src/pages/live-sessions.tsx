import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  Users,
  Play,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function LiveSessions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: liveSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/user/live-sessions"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const now = new Date();
  const upcomingSessions = liveSessions?.filter((sessionData: any) => 
    new Date(sessionData.session.scheduledAt) > now
  ) || [];
  
  const pastSessions = liveSessions?.filter((sessionData: any) => 
    new Date(sessionData.session.scheduledAt) <= now
  ) || [];

  const getSessionStatus = (scheduledAt: string) => {
    const sessionTime = new Date(scheduledAt);
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff < 0) return { status: 'ended', label: 'Ended', variant: 'secondary' as const };
    if (minutesDiff <= 15) return { status: 'starting', label: 'Starting Soon', variant: 'destructive' as const };
    if (minutesDiff <= 60) return { status: 'soon', label: `In ${minutesDiff}m`, variant: 'default' as const };
    
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) return { status: 'today', label: `In ${hoursDiff}h`, variant: 'secondary' as const };
    
    return { status: 'scheduled', label: sessionTime.toLocaleDateString(), variant: 'outline' as const };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Sessions</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your upcoming and past live classes
            </p>
          </div>

          {/* Calendar and Sessions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Custom calendar header */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h3 className="font-semibold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Sessions */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Sessions</h2>
                {sessionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No upcoming sessions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check back later for new live sessions.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((sessionData: any) => {
                      const statusInfo = getSessionStatus(sessionData.session.scheduledAt);
                      return (
                        <Card key={sessionData.session.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {sessionData.session.title}
                                  </h3>
                                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                  {sessionData.course.title}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>{new Date(sessionData.session.scheduledAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(sessionData.session.scheduledAt).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>Max {sessionData.session.maxParticipants}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-6 flex-shrink-0">
                                {/* Session thumbnail */}
                                <div className="w-32 h-20 bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center">
                                  <Video className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {sessionData.session.description}
                              </p>
                              <Link href={`/live-sessions/${sessionData.session.id}`}>
                                <Button
                                  variant={statusInfo.status === 'starting' ? 'destructive' : 'default'}
                                  className="ml-4"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  {statusInfo.status === 'starting' ? 'Join Now' : 'Join Session'}
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Past Sessions */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Sessions</h2>
                {pastSessions.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No past sessions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your completed sessions will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pastSessions.map((sessionData: any) => (
                      <Card key={sessionData.session.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {sessionData.session.title}
                                </h3>
                                <Badge variant="secondary">Completed</Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">
                                {sessionData.course.title}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{new Date(sessionData.session.scheduledAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(sessionData.session.scheduledAt).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-6 flex-shrink-0">
                              {/* Session thumbnail */}
                              <div className="w-32 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 text-white opacity-75" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {sessionData.session.description}
                            </p>
                            <Button variant="outline" disabled={!sessionData.session.recordingUrl}>
                              <Eye className="w-4 h-4 mr-2" />
                              {sessionData.session.recordingUrl ? 'View Recording' : 'No Recording'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
