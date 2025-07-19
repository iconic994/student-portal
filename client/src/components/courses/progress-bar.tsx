interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ progress, className = "", showLabel = false }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'from-green-500 to-emerald-500';
    if (progress >= 75) return 'from-blue-500 to-indigo-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    if (progress >= 25) return 'from-orange-500 to-red-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor(clampedProgress)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="h-full bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
