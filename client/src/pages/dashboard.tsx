import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import CourseCard from "@/components/courses/course-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, Bell, Calendar, Users } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Check onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ["/api/user/onboarding"],
    enabled: isAuthenticated,
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isAuthenticated && onboardingStatus === null) {
      // New user, redirect to onboarding
      window.location.href = "/onboarding";
      return;
    }
  }, [isAuthenticated, onboardingStatus]);

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

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: isAuthenticated,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/user/assignments"],
    enabled: isAuthenticated,
  });

  const { data: liveSessions, isLoading: liveSessionsLoading } = useQuery({
    queryKey: ["/api/user/live-sessions"],
    enabled: isAuthenticated,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const coursesInProgress = enrollments?.filter((e: any) => parseFloat(e.enrollment.progress) < 100) || [];
  const upcomingAssignments = assignments?.filter((a: any) => 
    !a.submission || a.submission.status === "pending"
  )?.slice(0, 3) || [];
  const upcomingSessions = liveSessions?.filter((s: any) => 
    new Date(s.session.scheduledAt) > new Date()
  )?.slice(0, 2) || [];
  const recentNotifications = notifications?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-emerald-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Student'}!
              </h1>
              <p className="text-blue-100 mb-6">
                Ready to continue your learning journey? You have {upcomingAssignments.length} assignments due this week.
              </p>
              <Button variant="secondary" size="lg">
                View Schedule
              </Button>
            </div>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses in Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{coursesInProgress.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments Due</p>
                    <p className="text-2xl font-bold text-orange-600">{upcomingAssignments.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Sessions</p>
                    <p className="text-2xl font-bold text-purple-600">{upcomingSessions.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
                    <p className="text-2xl font-bold text-emerald-600">{notifications?.filter((n: any) => !n.isRead).length || 0}</p>
                  </div>
                  <Bell className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses in Progress */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Courses in Progress</h2>
              <Button variant="outline">View All</Button>
            </div>
            {enrollmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : coursesInProgress.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No courses in progress. Start learning today!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesInProgress.map((enrollment: any) => (
                  <CourseCard 
                    key={enrollment.course.id} 
                    course={enrollment.course} 
                    progress={parseFloat(enrollment.enrollment.progress)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Live Sessions & Assignments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Live Sessions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Live Sessions</h2>
              <div className="space-y-4">
                {liveSessionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">No upcoming live sessions</p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingSessions.map((sessionData: any) => (
                    <Card key={sessionData.session.id} className="border-l-4 border-red-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{sessionData.session.title}</h3>
                          <Badge variant="destructive">
                            {new Date(sessionData.session.scheduledAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{sessionData.course.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(sessionData.session.scheduledAt).toLocaleTimeString()}
                          </span>
                          <Button size="sm">Join Session</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* Recent Assignments */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Assignments</h2>
              <div className="space-y-4">
                {assignmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : upcomingAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">No pending assignments</p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingAssignments.map((assignmentData: any) => (
                    <Card key={assignmentData.assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {assignmentData.assignment.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {assignmentData.course.title}
                            </p>
                          </div>
                          <Badge variant={assignmentData.assignment.dueDate && new Date(assignmentData.assignment.dueDate) < new Date() ? "destructive" : "secondary"}>
                            {assignmentData.assignment.dueDate ? 
                              `Due ${new Date(assignmentData.assignment.dueDate).toLocaleDateString()}` : 
                              'No due date'
                            }
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Type: {assignmentData.assignment.type}
                          </span>
                          <Button size="sm">
                            {assignmentData.submission ? 'View Submission' : 'Submit'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Recent Notifications */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Notifications</h2>
            <Card>
              <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                {notificationsLoading ? (
                  <div className="space-y-4 p-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No recent notifications</p>
                  </div>
                ) : (
                  recentNotifications.map((notification: any) => (
                    <div key={notification.id} className="p-6 flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">{notification.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
