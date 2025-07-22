import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/gamification/user-stats";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { Achievements } from "@/components/gamification/achievements";
import { Leaderboard } from "@/components/gamification/leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export default function GamificationPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Gamepad2 className="h-6 w-6" />
                Gamification Hub
              </CardTitle>
              <CardDescription>
                Please log in to view your progress and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your points, unlock badges, and compete with other community members!
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gamepad2 className="h-8 w-8" />
            Gamification Hub
          </h1>
          <p className="text-muted-foreground">
            Track your progress, collect badges, and climb the leaderboard
          </p>
        </div>
      </div>

      {/* User Stats Overview */}
      <UserStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <BadgeDisplay />
          <Achievements />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Leaderboard />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Earn More Points</CardTitle>
              <CardDescription>
                Here are some ways to boost your score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Create a post</p>
                  <p className="text-sm text-muted-foreground">Share your thoughts</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">+10 pts</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Add a comment</p>
                  <p className="text-sm text-muted-foreground">Join the discussion</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">+5 pts</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">React to content</p>
                  <p className="text-sm text-muted-foreground">Like posts and comments</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">+2 pts</span>
                </div>
              </div>

              <div className="pt-3">
                <Link href="/community">
                  <Button className="w-full">
                    Visit Communities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}