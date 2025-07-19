import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  BookOpen, 
  Video, 
  FileText, 
  User
} from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", isActive: location === "/" },
    { href: "/courses", icon: BookOpen, label: "Courses", isActive: location === "/courses" },
    { href: "/live-sessions", icon: Video, label: "Live", isActive: location.startsWith("/live-sessions") },
    { href: "/assignments", icon: FileText, label: "Tasks", isActive: location === "/assignments" },
    { href: "/certificates", icon: User, label: "Profile", isActive: location === "/certificates" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors cursor-pointer ${
              item.isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}>
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.label === "Tasks" && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    2
                  </Badge>
                )}
                {item.label === "Live" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
