import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import AssignmentCard from "@/components/assignments/assignment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Play,
  Eye
} from "lucide-react";

export default function Assignments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: assignments, isLoading: assignmentsLoading, error } = useQuery({
    queryKey: ["/api/user/assignments"],
    enabled: isAuthenticated,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, content }: { assignmentId: number, content: any }) => {
      return await apiRequest("POST", `/api/assignments/${assignmentId}/submit`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/assignments"] });
      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const currentAssignments = assignments?.filter((a: any) => 
    !a.submission || a.submission.status === "pending"
  ) || [];

  const pastAssignments = assignments?.filter((a: any) => 
    a.submission && (a.submission.status === "submitted" || a.submission.status === "graded")
  ) || [];

  const getStatusInfo = (assignment: any) => {
    if (!assignment.submission) {
      return { status: 'not_started', label: 'Not Started', variant: 'secondary' as const, color: 'gray' };
    }
    
    switch (assignment.submission.status) {
      case 'pending':
        return { status: 'pending', label: 'In Progress', variant: 'default' as const, color: 'blue' };
      case 'submitted':
        return { status: 'submitted', label: 'Submitted', variant: 'secondary' as const, color: 'yellow' };
      case 'graded':
        return { status: 'graded', label: 'Graded', variant: 'default' as const, color: 'green' };
      default:
        return { status: 'unknown', label: 'Unknown', variant: 'secondary' as const, color: 'gray' };
    }
  };

  const getDueDateInfo = (dueDate: string) => {
    if (!dueDate) return { label: 'No due date', variant: 'secondary' as const };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (daysDiff === 0) return { label: 'Due Today', variant: 'destructive' as const };
    if (daysDiff === 1) return { label: 'Due Tomorrow', variant: 'default' as const };
    if (daysDiff <= 7) return { label: `Due in ${daysDiff} days`, variant: 'default' as const };
    
    return { label: due.toLocaleDateString(), variant: 'secondary' as const };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments & Quizzes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress and submit your work
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {currentAssignments.length} Pending
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {pastAssignments.length} Completed
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">Current Assignments</TabsTrigger>
              <TabsTrigger value="past">Past Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-6">
              {assignmentsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : currentAssignments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You don't have any pending assignments.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {currentAssignments.map((assignmentData: any) => {
                    const assignment = assignmentData.assignment;
                    const course = assignmentData.course;
                    const dueDateInfo = getDueDateInfo(assignment.dueDate);
                    
                    return (
                      <Card key={assignment.id} className={`border-l-4 ${
                        dueDateInfo.variant === 'destructive' ? 'border-red-500' : 
                        dueDateInfo.variant === 'default' ? 'border-yellow-500' : 'border-gray-300'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {assignment.title}
                                </h3>
                                <Badge variant={dueDateInfo.variant}>
                                  {dueDateInfo.label}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                {course.title}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                {assignment.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <FileText className="w-4 h-4" />
                                  <span className="capitalize">{assignment.type}</span>
                                </div>
                                {assignment.maxScore && (
                                  <div className="flex items-center space-x-1">
                                    <span>Max Score: {assignment.maxScore}</span>
                                  </div>
                                )}
                                {assignment.timeLimit && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{assignment.timeLimit} minutes</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-6 flex-shrink-0">
                              <div className={`w-24 h-16 rounded-lg flex items-center justify-center ${
                                assignment.type === 'quiz' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                                assignment.type === 'project' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                                'bg-gradient-to-br from-emerald-400 to-emerald-600'
                              }`}>
                                {assignment.type === 'quiz' ? (
                                  <Play className="w-6 h-6 text-white" />
                                ) : (
                                  <FileText className="w-6 h-6 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {assignment.instructions && (
                                <p className="max-w-2xl truncate">{assignment.instructions}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {assignment.type === 'quiz' ? (
                                <Button 
                                  className="bg-blue-500 hover:bg-blue-600"
                                  disabled={submitAssignmentMutation.isPending}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Quiz
                                </Button>
                              ) : (
                                <Button 
                                  className="bg-emerald-500 hover:bg-emerald-600"
                                  onClick={() => submitAssignmentMutation.mutate({ 
                                    assignmentId: assignment.id, 
                                    content: {} 
                                  })}
                                  disabled={submitAssignmentMutation.isPending}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Submit Assignment
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastAssignments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No completed assignments
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your completed assignments will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Assignment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Submitted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {pastAssignments.map((assignmentData: any) => {
                            const assignment = assignmentData.assignment;
                            const course = assignmentData.course;
                            const submission = assignmentData.submission;
                            const statusInfo = getStatusInfo(assignmentData);
                            
                            return (
                              <tr key={assignment.id}>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {assignment.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {course.title}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={statusInfo.variant}>
                                    {statusInfo.label}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                  {submission?.score !== null && submission?.score !== undefined ? 
                                    `${submission.score}/${assignment.maxScore || 100}` : 
                                    'Pending'
                                  }
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {submission?.submittedAt ? 
                                    new Date(submission.submittedAt).toLocaleDateString() : 
                                    'Not submitted'
                                  }
                                </td>
                                <td className="px-6 py-4">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
