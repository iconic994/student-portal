import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Flame } from "lucide-react";

export function UserStats() {
  const { data: userPoints } = useQuery({
    queryKey: ['/api/user/points'],
  });

  const { data: userStreaks } = useQuery({
    queryKey: ['/api/user/streaks'],
  });

  if (!userPoints) return null;

  const levelProgress = (userPoints as any).currentLevelPoints || 0;
  const pointsToNext = (userPoints as any).pointsToNextLevel || 100;
  const totalForCurrentLevel = levelProgress + pointsToNext;
  const progressPercentage = (levelProgress / totalForCurrentLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(userPoints as any).totalPoints}</div>
          <p className="text-xs text-muted-foreground">
            +{(userPoints as any).weeklyPoints} this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Level</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Level {(userPoints as any).level}</div>
          <div className="mt-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelProgress} / {totalForCurrentLevel} XP
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Points</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(userPoints as any).monthlyPoints}</div>
          <p className="text-xs text-muted-foreground">
            This month's activity
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(userStreaks as any)?.find((s: any) => s.streakType === 'community_activity')?.currentStreak || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Days in a row
          </p>
        </CardContent>
      </Card>
    </div>
  );
}