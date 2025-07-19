import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ExternalLink, Award } from "lucide-react";

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl?: string;
}

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  course: Course;
  onDownload?: (certificateId: number, courseName: string) => void;
  onShare?: (certificateId: number, courseName: string) => void;
  onViewOnline?: (certificateId: number) => void;
  gradientIndex?: number;
}

export default function CertificateCard({
  certificate,
  course,
  onDownload,
  onShare,
  onViewOnline,
  gradientIndex = 0
}: CertificateCardProps) {
  
  const getCertificateGradient = (index: number) => {
    const gradients = [
      'from-amber-400 to-orange-500',
      'from-blue-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-purple-400 to-pink-500',
      'from-red-400 to-rose-500',
      'from-cyan-400 to-blue-500'
    ];
    return gradients[index % gradients.length];
  };

  const getCertificateIcon = (index: number) => {
    const icons = [Award, Award, Award, Award, Award, Award]; // Could vary these
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-6 h-6 text-white" />;
  };

  const handleDownload = () => {
    onDownload?.(certificate.id, course.title);
  };

  const handleShare = () => {
    onShare?.(certificate.id, course.title);
  };

  const handleViewOnline = () => {
    onViewOnline?.(certificate.id);
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Certificate Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Completed on {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Verified
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {course.title}
              </h3>
            </div>
            
            {/* Certificate Description */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                This certificate verifies the successful completion of the <strong>{course.title}</strong> course on Skillbanto. 
                The course covered comprehensive topics and practical applications in the field of study, 
                demonstrating mastery of key concepts and skills.
                {course.description && (
                  <span> {course.description}</span>
                )}
              </p>
            </div>
            
            {/* Certificate Details */}
            <div className="mb-6 space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Certificate ID:</span> {certificate.certificateNumber}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Issued by:</span> Skillbanto Learning Platform
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Verification:</span> This certificate can be verified online
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <Button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              <Button
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on LinkedIn
              </Button>
              
              <Button
                onClick={handleViewOnline}
                variant="outline"
                className="px-4 py-3 font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Online
              </Button>
            </div>
          </div>
          
          {/* Certificate Preview */}
          <div className="ml-8 flex-shrink-0">
            <div className={`w-72 h-44 bg-gradient-to-br ${getCertificateGradient(gradientIndex)} rounded-lg border-2 border-white dark:border-gray-600 p-6 relative overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300`}>
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-3 left-3 w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-2 border-white rounded-full"></div>
                {/* Additional decorative pattern */}
                <div className="absolute inset-4 border border-white/30 rounded-lg"></div>
              </div>
              
              {/* Certificate Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  {getCertificateIcon(gradientIndex)}
                </div>
                
                <h4 className="font-bold text-white text-lg mb-1 tracking-wide">
                  CERTIFICATE
                </h4>
                <h5 className="font-semibold text-white text-sm mb-3 opacity-90 tracking-wider">
                  OF COMPLETION
                </h5>
                
                <div className="flex-1 flex items-center">
                  <p className="text-white/95 text-sm leading-tight line-clamp-3 font-medium">
                    {course.title}
                  </p>
                </div>
                
                <div className="mt-auto pt-3 border-t border-white/20 w-full">
                  <p className="text-sm font-bold text-white tracking-wide">
                    SKILLBANTO
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    Learning Platform
                  </p>
                </div>
              </div>

              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
