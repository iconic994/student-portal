import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Star, Users, Search, Filter, PlayCircle } from "lucide-react";

export default function ExploreCourses() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  // Sample course data with additional fields for exploration
  const sampleCourses = [
    {
      id: 1,
      title: "React Complete Course",
      description: "Master React from basics to advanced concepts including hooks, context, and performance optimization",
      instructor: "John Doe",
      duration: "8 weeks",
      difficulty: "Beginner",
      category: "Programming",
      rating: 4.8,
      studentsEnrolled: 1250,
      price: 99.99,
      image_url: "/api/placeholder/react-course.jpg",
      modules: 12,
      isEnrolled: false
    },
    {
      id: 2,
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js, Express, and MongoDB",
      instructor: "Jane Smith",
      duration: "6 weeks",
      difficulty: "Intermediate",
      category: "Programming",
      rating: 4.9,
      studentsEnrolled: 890,
      price: 129.99,
      image_url: "/api/placeholder/nodejs-course.jpg",
      modules: 10,
      isEnrolled: false
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Learn Python programming for data analysis, visualization, and machine learning",
      instructor: "Mike Johnson",
      duration: "10 weeks",
      difficulty: "Beginner",
      category: "Data Science",
      rating: 4.7,
      studentsEnrolled: 1850,
      price: 89.99,
      image_url: "/api/placeholder/python-course.jpg",
      modules: 15,
      isEnrolled: true
    },
    {
      id: 4,
      title: "Advanced JavaScript Concepts",
      description: "Master closures, promises, async/await, and modern ES6+ features",
      instructor: "Sarah Wilson",
      duration: "6 weeks",
      difficulty: "Advanced",
      category: "Programming",
      rating: 4.9,
      studentsEnrolled: 650,
      price: 149.99,
      image_url: "/api/placeholder/js-advanced.jpg",
      modules: 8,
      isEnrolled: false
    },
    {
      id: 5,
      title: "MongoDB Database Design",
      description: "Learn NoSQL database design and MongoDB operations",
      instructor: "Alex Brown",
      duration: "4 weeks",
      difficulty: "Intermediate",
      category: "Database",
      rating: 4.6,
      studentsEnrolled: 420,
      price: 119.99,
      image_url: "/api/placeholder/mongodb-course.jpg",
      modules: 6,
      isEnrolled: false
    },
    {
      id: 6,
      title: "React Native Mobile Development",
      description: "Build cross-platform mobile apps with React Native",
      instructor: "David Chen",
      duration: "8 weeks",
      difficulty: "Advanced",
      category: "Mobile Development",
      rating: 4.8,
      studentsEnrolled: 380,
      price: 179.99,
      image_url: "/api/placeholder/react-native.jpg",
      modules: 12,
      isEnrolled: false
    }
  ];

  const filteredCourses = sampleCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = Array.from(new Set(sampleCourses.map(course => course.category)));
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnrollCourse = (courseId: number, courseTitle: string) => {
    // In a real implementation, this would make an API call to enroll
    console.log(`Enrolling in course: ${courseTitle}`);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Courses</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover new skills and advance your career with our comprehensive courses
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {filteredCourses.length} Courses Available
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses, instructors, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/80" />
                    </div>
                    {course.isEnrolled && (
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          by {course.instructor}
                        </CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.modules} modules</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({course.studentsEnrolled} students)</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${course.price}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex space-x-2">
                      {course.isEnrolled ? (
                        <Button className="flex-1" variant="outline">
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1"
                          onClick={() => handleEnrollCourse(course.id, course.title)}
                        >
                          Enroll Now
                        </Button>
                      )}
                      <Button variant="outline" size="icon">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Course Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Browse by Category</CardTitle>
              <CardDescription>
                Explore courses organized by subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const categoryCount = sampleCourses.filter(course => course.category === category).length;
                  return (
                    <div 
                      key={category}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{categoryCount} courses</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}