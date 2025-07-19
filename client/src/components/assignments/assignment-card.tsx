import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertCircle, Play, Eye } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  type: string;
  maxScore?: number;
  timeLimit?: number;
  dueDate?: string;
  instructions?: string;
}

interface Course {
  id: number;
  title: string;
}

interface Submission {
  id?: number;
  status: string;
  score?: number;
  submittedAt?: string;
  attemptNumber?: number;
}

interface AssignmentCardProps {
  assignment: Assignment;
  course: Course;
  submission?: Submission;
  onSubmit?: () => void;
  onView?: () => void;
  variant?: 'current' | 'past';
}

export default function AssignmentCard({ 
  assignment, 
  course, 
  submission, 
  onSubmit, 
  onView, 
  variant = 'current' 
}: AssignmentCardProps) {
  
  const getStatusInfo = () => {
    if (!submission) {
      return { status: 'not_started', label: 'Not Started', variant: 'secondary' as const, color: 'gray' };
    }
    
    switch (submission.status) {
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

  const getDueDateInfo = () => {
    if (!assignment.dueDate) return { label: 'No due date', variant: 'secondary' as const };
    
    const due = new Date(assignment.dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (daysDiff === 0) return { label: 'Due Today', variant: 'destructive' as const };
    if (daysDiff === 1) return { label: 'Due Tomorrow', variant: 'default' as const };
    if (daysDiff <= 7) return { label: `Due in ${daysDiff} days`, variant: 'default' as const };
    
    return { label: due.toLocaleDateString(), variant: 'secondary' as const };
  };

  const getTypeIcon = () => {
    switch (assignment.type.toLowerCase()) {
      case 'quiz':
        return <Play className="w-5 h-5" />;
      case 'project':
        return <FileText className="w-5 h-5" />;
      case 'essay':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (assignment.type.toLowerCase()) {
      case 'quiz':
        return 'from-blue-400 to-blue-600';
      case 'project':
        return 'from-purple-400 to-purple-600';
      case 'essay':
        return 'from-emerald-400 to-emerald-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const statusInfo = getStatusInfo();
  const dueDateInfo = variant === 'current' ? getDueDateInfo() : null;

  return (
    <Card className={`${
      variant === 'current' && dueDateInfo?.variant === 'destructive' 
        ? 'border-l-4 border-red-500' 
        : variant === 'current' && dueDateInfo?.variant === 'default'
        ? 'border-l-4 border-yellow-500'
        : ''
    } hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignment.title}
              </h3>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              {dueDateInfo && (
                <Badge variant={dueDateInfo.variant}>
                  {dueDateInfo.label}
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {course.title}
            </p>
            
            {assignment.description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {assignment.description}
              </p>
            )}

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

              {submission?.score !== null && submission?.score !== undefined && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Score: {submission.score}/{assignment.maxScore || 100}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Type Visual */}
          <div className="ml-6 flex-shrink-0">
            <div className={`w-20 h-16 rounded-lg bg-gradient-to-br ${getTypeColor()} flex items-center justify-center text-white`}>
              {getTypeIcon()}
            </div>
          </div>
        </div>

        {/* Instructions/Feedback */}
        {assignment.instructions && variant === 'current' && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Instructions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {assignment.instructions}
            </p>
          </div>
        )}

        {submission?.feedback && variant === 'past' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Feedback</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {submission.feedback}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {submission?.submittedAt && (
              <span>
                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            )}
            {submission?.attemptNumber && (
              <span className="ml-2">
                Attempt {submission.attemptNumber}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {variant === 'current' ? (
              assignment.type === 'quiz' ? (
                <Button 
                  onClick={onSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <Button 
                  onClick={onSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Assignment
                </Button>
              )
            ) : (
              <Button 
                onClick={onView}
                variant="outline"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
