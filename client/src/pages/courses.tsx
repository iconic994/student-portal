import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import CourseCard from "@/components/courses/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

export default function Courses() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: allCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const enrolledCourseIds = new Set(enrollments?.map((e: any) => e.course.id) || []);
  const availableCourses = allCourses?.filter((course: any) => !enrolledCourseIds.has(course.id)) || [];
  const enrolledCourses = enrollments?.map((e: any) => ({
    ...e.course,
    progress: parseFloat(e.enrollment.progress)
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning journey or explore new courses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search courses..." className="pl-10 w-64" />
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Enrolled Courses</h2>
            {enrollmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No enrolled courses yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your learning journey by enrolling in a course below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course: any) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    progress={course.progress}
                    enrolled={true}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Available Courses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Courses</h2>
            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No available courses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for new courses to enroll in.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course: any) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    enrolled={false}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
