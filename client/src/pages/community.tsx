import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Search,
  Hash,
  TrendingUp,
  Calendar,
  UserPlus,
  Filter
} from "lucide-react";

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  imageUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

const CATEGORIES = [
  'General Discussion',
  'Study Groups',
  'Career Advice',
  'Project Collaboration',
  'Tech Talk',
  'Help & Support',
  'Resources & Tips',
  'Off Topic'
];

export default function Community() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0],
    isPublic: true
  });

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

  // Load communities and user communities
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [communitiesRes, userCommunitiesRes] = await Promise.all([
          fetch('/api/communities'),
          fetch('/api/user/communities')
        ]);
        
        const [communitiesData, userCommunitiesData] = await Promise.all([
          communitiesRes.json(),
          userCommunitiesRes.json()
        ]);
        
        // Transform the API response to match the component's expected structure
        const transformedCommunities = communitiesData.map((item: any) => ({
          ...item.community,
          memberCount: item.memberCount || item.community.memberCount,
          postCount: item.postCount || item.community.postCount
        }));
        
        setCommunities(transformedCommunities);
        setUserCommunities(userCommunitiesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load communities",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, toast]);

  const handleCreateCommunity = async () => {
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommunity),
      });

      if (response.ok) {
        const community = await response.json();
        setCommunities(prev => [community, ...prev]);
        setIsCreateDialogOpen(false);
        setNewCommunity({
          name: "",
          description: "",
          category: CATEGORIES[0],
          isPublic: true
        });
        
        toast({
          title: "Success",
          description: "Community created successfully!",
        });
      } else {
        throw new Error('Failed to create community');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      });
    }
  };

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update UI to show joined status
        setCommunities(prev => prev.map(c => 
          c.id === communityId 
            ? { ...c, memberCount: c.memberCount + 1 }
            : c
        ));
        
        toast({
          title: "Success",
          description: "Joined community successfully!",
        });
      } else {
        throw new Error('Failed to join community');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      });
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isUserMember = (communityId: number) => {
    return userCommunities.some(uc => uc.community?.id === communityId);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Community Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Connect, learn, and grow with fellow students
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Community Name</label>
                    <Input
                      placeholder="Enter community name"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder="Describe your community"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCommunity} disabled={!newCommunity.name.trim()}>
                      Create Community
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="explore">Explore Communities</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore" className="space-y-6 mt-6">
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Hash className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {community.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {community.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {community.description || "Join this community to start connecting with other students!"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{community.memberCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{community.postCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/community/${community.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Community
                        </Button>
                      </Link>
                      {!isUserMember(community.id) && (
                        <Button 
                          onClick={() => handleJoinCommunity(community.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCommunities.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No communities found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or create a new community.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="joined" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities.map((uc) => (
                <Card key={uc.community.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Hash className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {uc.community.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {uc.memberRole}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {uc.community.description || "Active community member"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{uc.community.memberCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{uc.community.postCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/community/${uc.community.id}`} className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Open Community
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userCommunities.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No communities joined yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Explore and join communities to connect with other students.
                </p>
                <Button 
                  onClick={() => {
                    const tabsTrigger = document.querySelector('[data-state="inactive"]') as HTMLElement;
                    tabsTrigger?.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Explore Communities
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}