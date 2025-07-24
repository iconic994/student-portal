import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Play, 
  CheckCircle,
  Award,
  Calendar,
  DollarSign,
  Video,
  FileText,
  Download,
  Heart,
  Share2,
  ChevronRight,
  Lock
} from "lucide-react";

export default function CoursePreview() {
  const [, params] = useRoute("/courses/:id/preview");
  const courseId = params?.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const { data: modules } = useQuery({
    queryKey: ["/api/courses", courseId, "modules"],
    enabled: !!courseId,
  });

  const { data: instructor } = useQuery({
    queryKey: ["/api/users", (course as any)?.instructorId],
    enabled: !!(course as any)?.instructorId,
  });

  const { data: enrollments } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: isAuthenticated,
  });

  const isEnrolled = (enrollments as any[])?.some((e: any) => e.enrollment.courseId === parseInt(courseId || "0"));

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("Course ID required");
      return await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in the course. Start learning now!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return;
    }
    enrollMutation.mutate();
  };

  const handleModulePreview = (moduleId: number) => {
    setSelectedModule(moduleId);
    setIsVideoPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-6">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Course not found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The course you're looking for doesn't exist or has been removed.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative p-8 lg:p-12">
              <div className="max-w-4xl">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={getDifficultyColor((course as any).difficulty)}>
                    {(course as any).difficulty}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    1,250+ students
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                    4.8 rating
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {(course as any).title}
                </h1>
                
                <p className="text-xl text-white/90 mb-6 max-w-3xl leading-relaxed">
                  {(course as any).description}
                </p>

                <div className="flex items-center space-x-6 mb-8">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{(course as any).duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{(modules as any[])?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Certificate included</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {isEnrolled ? (
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-white text-black hover:bg-gray-100"
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        "Enrolling..."
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5 mr-2" />
                          Enroll Now - Free
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <Heart className="w-5 h-5 mr-2" />
                    Save for Later
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Preview Video */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Course Preview
                    </CardTitle>
                    <CardDescription>
                      Watch this preview to get a feel for the course content and teaching style
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                      {isVideoPlaying ? (
                        <video 
                          controls 
                          className="w-full h-full object-cover"
                          poster="/api/placeholder/course-preview-thumb.jpg"
                        >
                          <source src="/api/placeholder/course-preview.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                          <Button 
                            size="lg"
                            onClick={() => setIsVideoPlaying(true)}
                            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          >
                            <Play className="w-8 h-8 mr-2" />
                            Play Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Content Tabs */}
                <Tabs defaultValue="modules" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="instructor">Instructor</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="modules" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Modules</CardTitle>
                        <CardDescription>
                          {(modules as any[])?.length || 0} modules • {(course as any).duration} total duration
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(modules as any[])?.map((module: any, index: number) => (
                          <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {module.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {module.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 ml-11">
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>{module.durationMinutes || 45} min</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Video className="w-4 h-4" />
                                    <span>Video + Quiz</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {index === 0 ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleModulePreview(module.id)}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                ) : (
                                  <div className="flex items-center text-gray-400">
                                    <Lock className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Locked</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="instructor">
                    <Card>
                      <CardHeader>
                        <CardTitle>Meet Your Instructor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="/api/placeholder/instructor.jpg" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              John Doe
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Senior Software Engineer at Tech Corp
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                              John is a passionate educator and experienced developer with over 8 years in the industry. 
                              He has worked with companies like Google, Microsoft, and various startups, specializing in 
                              React, Node.js, and modern web development practices.
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="font-semibold text-gray-900 dark:text-white">15+</div>
                                <div className="text-gray-600 dark:text-gray-400">Courses</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="font-semibold text-gray-900 dark:text-white">25k+</div>
                                <div className="text-gray-600 dark:text-gray-400">Students</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="font-semibold text-gray-900 dark:text-white">4.9</div>
                                <div className="text-gray-600 dark:text-gray-400">Rating</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Reviews</CardTitle>
                        <CardDescription>
                          See what other students are saying about this course
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          {
                            name: "Sarah Johnson",
                            rating: 5,
                            comment: "Excellent course! The instructor explains concepts clearly and the hands-on projects really helped me understand React deeply.",
                            date: "2 weeks ago"
                          },
                          {
                            name: "Mike Chen",
                            rating: 5,
                            comment: "This course transformed my understanding of React. The practical examples and real-world projects made all the difference.",
                            date: "1 month ago"
                          },
                          {
                            name: "Emily Davis",
                            rating: 4,
                            comment: "Great content and well-structured. I wish there were more advanced topics, but perfect for beginners to intermediate level.",
                            date: "3 weeks ago"
                          }
                        ].map((review, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {review.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="requirements">
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Requirements</CardTitle>
                        <CardDescription>
                          What you need to know before starting this course
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Basic understanding of HTML and CSS</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Familiarity with JavaScript fundamentals</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>A computer with internet connection</span>
                            </li>
                          </ul>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What You'll Learn</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                              <ChevronRight className="w-4 h-4 text-blue-500" />
                              <span>Build modern React applications from scratch</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <ChevronRight className="w-4 h-4 text-blue-500" />
                              <span>Master React hooks and state management</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <ChevronRight className="w-4 h-4 text-blue-500" />
                              <span>Create responsive and interactive user interfaces</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <ChevronRight className="w-4 h-4 text-blue-500" />
                              <span>Deploy React applications to production</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Enrollment Card */}
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {isEnrolled ? "You're Enrolled!" : "Start Learning Today"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEnrolled ? (
                      <>
                        <div className="text-center">
                          <Progress value={35} className="mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">35% Complete</p>
                        </div>
                        <Button className="w-full" size="lg">
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Free
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Limited time offer
                          </p>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleEnroll}
                          disabled={enrollMutation.isPending}
                        >
                          {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="font-medium">{(course as any).duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Modules:</span>
                        <span className="font-medium">{(modules as any[])?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Level:</span>
                        <Badge className={getDifficultyColor((course as any).difficulty)}>
                          {(course as any).difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Certificate:</span>
                        <span className="font-medium text-green-600">Included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>This Course Includes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: Video, text: "HD video content" },
                      { icon: FileText, text: "Downloadable resources" },
                      { icon: Award, text: "Certificate of completion" },
                      { icon: Users, text: "Community access" },
                      { icon: Calendar, text: "Live Q&A sessions" },
                      { icon: Download, text: "Source code included" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <feature.icon className="w-5 h-5 text-green-600" />
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}