import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/navigation/header";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import CertificateCard from "@/components/certificates/certificate-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, ExternalLink } from "lucide-react";

export default function Certificates() {
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

  const { data: certificates, isLoading: certificatesLoading, error } = useQuery({
    queryKey: ["/api/user/certificates"],
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

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleDownloadCertificate = (certificateId: number, courseName: string) => {
    // In a real implementation, this would download the PDF
    toast({
      title: "Download Started",
      description: `Downloading certificate for ${courseName}`,
    });
  };

  const handleShareOnLinkedIn = (certificateId: number, courseName: string) => {
    // In a real implementation, this would open LinkedIn sharing dialog
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}/certificates/${certificateId}`;
    window.open(linkedInUrl, '_blank');
    
    toast({
      title: "Sharing on LinkedIn",
      description: `Sharing your ${courseName} certificate`,
    });
  };

  const getCertificateColor = (index: number) => {
    const colors = [
      'from-amber-400 to-orange-500',
      'from-blue-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-purple-400 to-pink-500',
      'from-red-400 to-rose-500',
      'from-cyan-400 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  const getCertificateIcon = (index: number) => {
    const icons = ['award', 'medal', 'trophy', 'star', 'shield', 'crown'];
    return icons[index % icons.length];
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your achievements and completed course certifications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {(certificates && Array.isArray(certificates) ? certificates.length : 0)} Certificates Earned
              </Badge>
            </div>
          </div>

          {/* Certificates List */}
          {certificatesLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !certificates || !Array.isArray(certificates) || certificates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No certificates yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Complete your first course to earn your first certificate!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(certificates as any[]).map((certificateData: any, index: number) => {
                const certificate = certificateData.certificate;
                const course = certificateData.course;
                
                return (
                  <Card key={certificate.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Completed on {new Date(certificate.issuedAt).toLocaleDateString()}
                              </span>
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Verified
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              {course.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-3xl">
                            This certificate verifies the successful completion of the {course.title} course on Skillbanto. 
                            The course covered comprehensive topics and practical applications in the field of study. 
                            {course.description && ` ${course.description}`}
                          </p>
                          
                          <div className="mb-6">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Certificate ID: {certificate.certificateNumber}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Issued by Skillbanto Learning Platform
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleDownloadCertificate(certificate.id, course.title)}
                              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </button>
                            <button
                              onClick={() => handleShareOnLinkedIn(certificate.id, course.title)}
                              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share on LinkedIn
                            </button>
                            <button
                              className="inline-flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Online
                            </button>
                          </div>
                        </div>
                        
                        {/* Certificate Preview */}
                        <div className="ml-8 flex-shrink-0">
                          <div className={`w-64 h-40 bg-gradient-to-br ${getCertificateColor(index)} rounded-lg border-2 border-white dark:border-gray-600 p-4 relative overflow-hidden shadow-lg`}>
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-2 left-2 w-4 h-4 border-2 border-white rounded-full"></div>
                              <div className="absolute top-2 right-2 w-4 h-4 border-2 border-white rounded-full"></div>
                              <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-white rounded-full"></div>
                              <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-white rounded-full"></div>
                            </div>
                            
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-bold text-white text-sm mb-1">CERTIFICATE</h4>
                              <h5 className="font-semibold text-white text-xs mb-2 leading-tight">
                                OF COMPLETION
                              </h5>
                              <p className="text-white/90 text-xs mb-2 leading-tight line-clamp-2">
                                {course.title}
                              </p>
                              <div className="mt-auto pt-2 border-t border-white/20 w-full">
                                <p className="text-xs font-medium text-white">Skillbanto</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
