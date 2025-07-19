import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "./progress-bar";
import { BookOpen, Clock, Users, Play } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description?: string;
  instructorId: string;
  imageUrl?: string;
  totalModules?: number;
  duration?: string;
  difficulty?: string;
}

interface CourseCardProps {
  course: Course;
  progress?: number;
  enrolled?: boolean;
}

export default function CourseCard({ course, progress, enrolled = false }: CourseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      return await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course!",
      });
    },
    onError: () => {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCourseImage = () => {
    if (course.imageUrl) return course.imageUrl;
    
    // Generate a gradient based on course title
    const gradients = [
      'from-blue-400 to-purple-500',
      'from-emerald-400 to-teal-500', 
      'from-orange-400 to-red-500',
      'from-purple-400 to-pink-500',
      'from-cyan-400 to-blue-500',
      'from-green-400 to-emerald-500'
    ];
    
    const index = course.title.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const courseImage = getCourseImage();
  const isGradient = !course.imageUrl;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Course Image/Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {isGradient ? (
          <div className={`w-full h-full bg-gradient-to-br ${courseImage} relative`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        ) : (
          <img
            src={courseImage}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Overlay with progress or difficulty badge */}
        <div className="absolute top-4 left-4">
          {enrolled && progress !== undefined ? (
            <Badge className="bg-white/90 text-gray-900">
              {Math.round(progress)}% Complete
            </Badge>
          ) : course.difficulty ? (
            <Badge className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
          ) : null}
        </div>

        {/* Quick action button overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {enrolled ? (
            <Link href={`/courses/${course.id}/modules/1`}>
              <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                <Play className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              onClick={() => enrollMutation.mutate(course.id)}
              disabled={enrollMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll'}
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Course Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {course.description}
            </p>
          )}
        </div>

        {/* Course Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            {course.totalModules && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.totalModules} modules</span>
              </div>
            )}
            {course.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for enrolled courses */}
        {enrolled && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          {enrolled ? (
            <Link href={`/courses/${course.id}/modules/1`} className="flex-1">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                {progress === 100 ? 'Review Course' : 'Continue Learning'}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => enrollMutation.mutate(course.id)}
              disabled={enrollMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
