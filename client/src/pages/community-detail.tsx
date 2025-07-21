import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Heart,
  MessageCircle,
  Share,
  ArrowLeft,
  Hash,
  Clock,
  UserPlus,
  UserMinus,
  Send,
  Pin,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface Post {
  post: {
    id: number;
    title?: string;
    content: string;
    type: string;
    isPinned: boolean;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface Comment {
  comment: {
    id: number;
    content: string;
    likeCount: number;
    createdAt: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function CommunityDetail() {
  const params = useParams();
  const communityId = parseInt(params.id!);
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "text"
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

  // Load community data
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [communityRes, postsRes, userCommunitiesRes] = await Promise.all([
          fetch(`/api/communities/${communityId}`),
          fetch(`/api/communities/${communityId}/posts`),
          fetch('/api/user/communities')
        ]);
        
        const [communityData, postsData, userCommunitiesData] = await Promise.all([
          communityRes.json(),
          postsRes.json(),
          userCommunitiesRes.json()
        ]);
        
        setCommunity(communityData);
        setPosts(postsData);
        
        // Check if user is member
        const isUserMember = userCommunitiesData.some((uc: any) => uc.community?.id === communityId);
        setIsMember(isUserMember);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load community data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      loadData();
    }
  }, [communityId, isAuthenticated, toast]);

  const handleJoinCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsMember(true);
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
        
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

  const handleLeaveCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsMember(false);
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
        
        toast({
          title: "Success",
          description: "Left community successfully!",
        });
      } else {
        throw new Error('Failed to leave community');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const postData = await response.json();
        setPosts(prev => [postData, ...prev]);
        setIsCreatePostDialogOpen(false);
        setNewPost({ title: "", content: "", type: "text" });
        
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const commentsData = await response.json();
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleToggleComments = async (postId: number) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setExpandedComments(prev => new Set(prev).add(postId));
      if (!comments[postId]) {
        await loadComments(postId);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        // Reload comments
        await loadComments(postId);
        
        // Clear input
        setNewComment(prev => ({ ...prev, [postId]: "" }));
        
        // Update post comment count
        setPosts(prev => prev.map(p => 
          p.post.id === postId 
            ? { ...p, post: { ...p.post, commentCount: p.post.commentCount + 1 } }
            : p
        ));

        toast({
          title: "Success",
          description: "Comment added successfully!",
        });
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleReactToPost = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType: 'like' }),
      });

      if (response.ok) {
        // Update UI optimistically
        setPosts(prev => prev.map(p => 
          p.post.id === postId 
            ? { ...p, post: { ...p.post, likeCount: p.post.likeCount + 1 } }
            : p
        ));
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const formatPostTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getAuthorDisplayName = (author: any) => {
    return `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Anonymous';
  };

  const getAuthorInitials = (author: any) => {
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Community not found
          </h2>
          <Link href="/community">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/community">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {community.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{community.memberCount} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{community.postCount} posts</span>
              </div>
              <Badge variant="secondary">{community.category}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {isMember ? (
                <>
                  <Dialog open={isCreatePostDialogOpen} onOpenChange={setIsCreatePostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                          <Input
                            placeholder="Enter post title"
                            value={newPost.title}
                            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Content</label>
                          <Textarea
                            placeholder="What's on your mind?"
                            rows={4}
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreatePostDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                            Create Post
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={handleLeaveCommunity}>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                </>
              ) : (
                <Button onClick={handleJoinCommunity} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isMember ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.post.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author.profileImageUrl} />
                      <AvatarFallback>{getAuthorInitials(post.author)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getAuthorDisplayName(post.author)}
                        </h3>
                        {post.post.isPinned && (
                          <Pin className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatPostTime(post.post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {post.post.title && (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.post.title}
                    </h2>
                  )}
                  
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {post.post.content}
                  </div>
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleReactToPost(post.post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.post.likeCount}</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleComments(post.post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.post.commentCount}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share className="w-4 h-4" />
                        <span className="text-sm">{post.post.shareCount}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  {expandedComments.has(post.post.id) && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex space-x-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newComment[post.post.id] || ""}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.post.id]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.post.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.post.id)}
                            disabled={!newComment[post.post.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Comments List */}
                      {comments[post.post.id]?.map((comment) => (
                        <div key={comment.comment.id} className="flex space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.author.profileImageUrl} />
                            <AvatarFallback>{getAuthorInitials(comment.author)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {getAuthorDisplayName(comment.author)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatPostTime(comment.comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {comment.comment.content}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <button className="text-xs text-gray-500 hover:text-red-500 flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{comment.comment.likeCount}</span>
                              </button>
                              <button className="text-xs text-gray-500 hover:text-blue-500">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to share something with this community!
                </p>
                <Button
                  onClick={() => setIsCreatePostDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Join to participate</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Join this community to view posts, share content, and connect with other members.
            </p>
            <Button
              onClick={handleJoinCommunity}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}