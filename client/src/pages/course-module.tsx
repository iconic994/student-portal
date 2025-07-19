import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Lock, 
  Download, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Send
} from "lucide-react";

export default function CourseModule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { id: courseId, moduleId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [comment, setComment] = useState("");
  const [watchTime, setWatchTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Load existing notes when module loads
  useEffect(() => {
    const loadNotes = async () => {
      if (moduleId && isAuthenticated) {
        try {
          const response = await fetch(`/api/modules/${moduleId}/notes`);
          if (response.ok) {
            const data = await response.json();
            if (data?.content) {
              setNotes(data.content);
            }
          }
        } catch (error) {
          console.error('Error loading notes:', error);
        }
      }
    };
    
    loadNotes();
  }, [moduleId, isAuthenticated]);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: isAuthenticated && !!courseId,
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "modules"],
    enabled: isAuthenticated && !!courseId,
  });

  const { data: currentModule, isLoading: moduleLoading } = useQuery({
    queryKey: ["/api/modules", moduleId],
    enabled: isAuthenticated && !!moduleId,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/modules", moduleId, "resources"],
    enabled: isAuthenticated && !!moduleId,
  });

  const { data: discussions, isLoading: discussionsLoading } = useQuery({
    queryKey: ["/api/modules", moduleId, "discussions"],
    enabled: isAuthenticated && !!moduleId,
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { watchTime: number; isCompleted: boolean }) => {
      return await apiRequest("POST", `/api/modules/${moduleId}/progress`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/discussions", {
        moduleId: parseInt(moduleId!),
        content,
        title: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules", moduleId, "discussions"] });
      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    },
  });

  const notesMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/modules/${moduleId}/notes`, { content });
    },
    onSuccess: () => {
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
    },
  });

  const handleMarkComplete = () => {
    const currentWatchTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : watchTime;
    progressMutation.mutate({ watchTime: currentWatchTime, isCompleted: true });
    toast({
      title: "Module completed",
      description: "Great job! You've completed this module.",
    });
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  const handleSaveNotes = () => {
    if (!notes.trim()) return;
    notesMutation.mutate(notes);
  };

  const handleModuleClick = (newModuleId: number) => {
    setLocation(`/courses/${courseId}/module/${newModuleId}`);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      setWatchTime(currentTime);
      
      // Auto-save progress every 30 seconds
      if (currentTime % 30 === 0 && currentTime > 0) {
        progressMutation.mutate({ watchTime: currentTime, isCompleted: false });
      }
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (courseLoading || modulesLoading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
            {/* Course Modules Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Course Modules</h3>
                  <div className="space-y-3">
                    {modules?.map((module: any, index: number) => (
                      <div
                        key={module.id}
                        onClick={() => !module.isLocked && handleModuleClick(module.id)}
                        className={`p-3 rounded-lg border transition-colors ${
                          module.isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        } ${
                          module.id === parseInt(moduleId!)
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                            module.isLocked ? "bg-gray-400" : "bg-blue-500"
                          }`}>
                            {module.isLocked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              Module {index + 1}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{module.title}</p>
                            {module.durationMinutes && (
                              <p className="text-gray-500 dark:text-gray-500 text-xs">
                                {module.durationMinutes} min
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Video Player */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-900 rounded-t-lg">
                    {currentModule?.videoUrl ? (
                      <video
                        ref={videoRef}
                        controls
                        className="w-full h-full rounded-t-lg"
                        poster="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={() => {
                          if (videoRef.current) {
                            console.log('Video loaded:', currentModule.title);
                          }
                        }}
                        onError={(e) => {
                          console.error('Video error:', e);
                          toast({
                            title: "Video Error",
                            description: "There was an issue loading the video. Please try refreshing.",
                            variant: "destructive"
                          });
                        }}
                      >
                        <source src={currentModule.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-t-lg">
                        <div className="text-center text-white">
                          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Video content not available</p>
                          <p className="text-sm opacity-75">This module may contain text-based content</p>
                        </div>
                      </div>
                    )}
                    {currentModule?.durationMinutes && (
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="text-white text-sm">
                          Duration: {currentModule.durationMinutes} minutes
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {currentModule?.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          {currentModule?.description}
                        </p>
                      </div>
                      <Button onClick={handleMarkComplete} disabled={progressMutation.isPending}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Card>
                <Tabs defaultValue="notes" className="w-full">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                    <TabsList className="bg-transparent">
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="quiz">Quiz</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="notes" className="p-6">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Take notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-32"
                      />
                      <Button 
                        onClick={handleSaveNotes} 
                        disabled={!notes.trim() || notesMutation.isPending}
                      >
                        {notesMutation.isPending ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="p-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Module Resources</h4>
                      {resourcesLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : resources?.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No resources available for this module</p>
                        </div>
                      ) : (
                        resources?.map((resource: any) => (
                          <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {resource.title}
                                </h5>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">
                                  {resource.fileType?.toUpperCase()} • {resource.fileSize ? `${Math.round(resource.fileSize / 1024)} KB` : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="p-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Module Quiz</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Test your knowledge with a quiz for this module
                      </p>
                      <Button>Start Quiz</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="p-6">
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Discussion</h4>
                      
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <img
                          src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}&background=3b82f6&color=fff`}
                          alt="Your profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Ask a question or share your thoughts..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <Button 
                            onClick={handlePostComment}
                            disabled={!comment.trim() || commentMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                          </Button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {discussionsLoading ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex space-x-3">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : discussions?.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to start the discussion!</p>
                          </div>
                        ) : (
                          discussions?.map((discussion: any) => (
                            <div key={discussion.id} className="flex items-start space-x-3">
                              <img
                                src={`https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff`}
                                alt="User profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">Anonymous User</span>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(discussion.createdAt).toLocaleDateString()}
                                  </span>
                                  {discussion.isInstructor && (
                                    <Badge variant="secondary" className="text-xs">Instructor</Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{discussion.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
