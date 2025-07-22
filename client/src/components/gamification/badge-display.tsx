import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, Lock } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface BadgeItem {
  badge: {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    rarity: string;
  };
  earnedAt: string;
  isVisible: boolean;
}

export function BadgeDisplay() {
  const { data: userBadges = [] } = useQuery<BadgeItem[]>({
    queryKey: ['/api/user/badges'],
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['/api/badges'],
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? IconComponent : Award;
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges
        </CardTitle>
        <CardDescription>
          Collect badges by participating in community activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earned Badges */}
            {userBadges.map((userBadge) => {
              const IconComponent = getIcon(userBadge.badge.icon);
              return (
                <div
                  key={userBadge.badge.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  style={{ borderColor: userBadge.badge.color }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: userBadge.badge.color + '20' }}
                  >
                    <IconComponent
                      className="h-5 w-5"
                      style={{ color: userBadge.badge.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {userBadge.badge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {userBadge.badge.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={getRarityColor(userBadge.badge.rarity)}
                      >
                        {userBadge.badge.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Unearned Badges */}
            {(allBadges as any[])
              .filter((badge: any) => !earnedBadgeIds.has(badge.id))
              .map((badge: any) => {
                const IconComponent = getIcon(badge.icon);
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-60"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-muted-foreground">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </p>
                      <Badge
                        variant="outline"
                        className={getRarityColor(badge.rarity)}
                      >
                        {badge.rarity}
                      </Badge>
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