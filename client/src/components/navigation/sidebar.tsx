import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Award,
  Video,
  Clock,
  Users
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: enrollments } = useQuery({
    queryKey: ["/api/user/enrollments"],
  });

  const { data: liveSessions } = useQuery({
    queryKey: ["/api/user/live-sessions"],
  });

  const coursesInProgress = enrollments?.filter((e: any) => parseFloat(e.enrollment.progress) < 100) || [];
  const totalCertificates = 8; // This would come from certificates API
  
  const upcomingSession = liveSessions?.find((s: any) => {
    const sessionTime = new Date(s.session.scheduledAt);
    const now = new Date();
    const timeDiff = sessionTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 30 * 60 * 1000; // Within 30 minutes
  });

  const formatTimeLeft = (scheduledAt: string) => {
    const sessionTime = new Date(scheduledAt);
    const now = new Date();
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard", isActive: location === "/" },
    { href: "/courses", icon: BookOpen, label: "My Courses", isActive: location === "/courses" },
    { href: "/live-sessions", icon: Video, label: "Live Sessions", isActive: location.startsWith("/live-sessions") },
    { href: "/assignments", icon: FileText, label: "Assignments", isActive: location === "/assignments" },
    { href: "/certificates", icon: Award, label: "Certificates", isActive: location === "/certificates" },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 fixed h-full transition-colors duration-300">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Courses in Progress</p>
                <p className="text-lg font-bold text-blue-600">{coursesInProgress.length}</p>
              </div>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-lg font-bold text-emerald-600">{totalCertificates}</p>
              </div>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </h3>
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                item.isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        {/* Upcoming Live Session Alert */}
        {upcomingSession && (
          <div className="p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl text-white">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Session Starting</span>
            </div>
            <p className="text-xs opacity-90 mb-2 truncate">
              {upcomingSession.session.title}
            </p>
            <p className="text-lg font-bold mb-3">
              {formatTimeLeft(upcomingSession.session.scheduledAt)}
            </p>
            <Link href={`/live-sessions/${upcomingSession.session.id}`}>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-2 transition-colors border-0">
                Join Now
              </Button>
            </Link>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Activity
          </h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Module completed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Data Science Course
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Certificate earned
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Python Programming
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center space-x-3">
            <img
              src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}&background=3b82f6&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName || 'Student'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-white dark:bg-gray-600 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">{coursesInProgress.length}</div>
              <div className="text-gray-500 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-600 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white">{totalCertificates}</div>
              <div className="text-gray-500 dark:text-gray-400">Earned</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
