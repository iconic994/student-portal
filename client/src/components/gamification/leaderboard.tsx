import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Star, TrendingUp, Calendar } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  score: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  metadata?: any;
}

export function Leaderboard() {
  const { data: weeklyLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', 'weekly_points', 'current_week'],
  });

  const { data: monthlyLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', 'monthly_points', 'current_month'],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  const LeaderboardList = ({ data, period }: { data: LeaderboardEntry[]; period: string }) => (
    <div className="space-y-3">
      {data.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No rankings available yet.</p>
          <p className="text-sm">Start participating to appear on the leaderboard!</p>
        </div>
      ) : (
        data.map((entry) => (
          <div
            key={entry.user.id}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              entry.rank <= 3 
                ? 'bg-gradient-to-r from-background to-muted/50 border-primary/20' 
                : 'bg-card'
            }`}
          >
            <div className="flex items-center justify-center w-10">
              {getRankIcon(entry.rank)}
            </div>

            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
              <AvatarFallback>
                {entry.user.name?.charAt(0) || entry.user.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">
                {entry.user.name || entry.user.email}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={getRankBadgeVariant(entry.rank)}
                  className="text-xs"
                >
                  {entry.rank <= 3 ? `${['🥇', '🥈', '🥉'][entry.rank - 1]} #${entry.rank}` : `#${entry.rank}`}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {entry.score} points {period === 'week' ? 'this week' : 'this month'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {entry.score}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          See how you rank against other community members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">
            <div className="max-h-96 overflow-y-auto">
              <LeaderboardList data={weeklyLeaderboard} period="week" />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="max-h-96 overflow-y-auto">
              <LeaderboardList data={monthlyLeaderboard} period="month" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}