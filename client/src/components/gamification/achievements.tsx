import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Clock, Lock } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface UserAchievement {
  achievement: {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    pointsReward: number;
  };
  progress: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export function Achievements() {
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ['/api/user/achievements'],
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? IconComponent : Target;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'learning':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'consistency':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'milestone':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievement.id, ua])
  );

  // Combine all achievements with user progress
  const combinedAchievements = (allAchievements as any[]).map((achievement: any) => {
    const userProgress = userAchievementMap.get(achievement.id);
    return {
      ...achievement,
      userProgress: userProgress ? parseFloat(userProgress.progress) : 0,
      isCompleted: userProgress?.isCompleted || false,
      completedAt: userProgress?.completedAt || null,
    };
  });

  // Sort: completed first, then by progress, then by points reward
  const sortedAchievements = combinedAchievements.sort((a: any, b: any) => {
    if (a.isCompleted !== b.isCompleted) {
      return b.isCompleted ? 1 : -1;
    }
    if (a.userProgress !== b.userProgress) {
      return b.userProgress - a.userProgress;
    }
    return b.pointsReward - a.pointsReward;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>
          Complete challenges to earn points and unlock rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {sortedAchievements.map((achievement: any) => {
              const IconComponent = getIcon(achievement.icon);
              const progress = achievement.userProgress;
              const isCompleted = achievement.isCompleted;

              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      : 'bg-card'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : progress > 0 ? (
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-medium ${
                          isCompleted ? 'text-green-700 dark:text-green-300' : ''
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={getCategoryColor(achievement.category)}
                          >
                            {achievement.category}
                          </Badge>
                          <Badge variant="outline">
                            +{achievement.pointsReward} points
                          </Badge>
                          {isCompleted && achievement.completedAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(achievement.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCompleted && progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}