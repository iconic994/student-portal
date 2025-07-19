import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import VideoControls from "@/components/live-session/video-controls";
import ChatPanel from "@/components/live-session/chat-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Users, 
  Clock,
  Settings,
  Maximize,
  Minimize
} from "lucide-react";

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

export default function LiveSessionRoom() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { id: sessionId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(45);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'Sarah Johnson',
      message: 'Great explanation of data preprocessing techniques!',
      timestamp: '10:15 AM'
    },
    {
      id: '2',
      author: 'Mike Chen',
      message: 'Could you show the pandas example again?',
      timestamp: '10:16 AM'
    }
  ]);

  // WebSocket connection for real-time features
  const { sendMessage, lastMessage, isConnected } = useWebSocket();

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

  // Join session on component mount
  useEffect(() => {
    if (isConnected && sessionId) {
      sendMessage({
        type: 'join_session',
        sessionId: sessionId,
        userId: user?.id,
        username: user?.firstName || 'Anonymous'
      });
    }
  }, [isConnected, sessionId, user, sendMessage]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'chat_message':
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            author: data.author,
            message: data.message,
            timestamp: new Date(data.timestamp).toLocaleTimeString()
          }]);
          break;
        case 'hand_raised':
          toast({
            title: "Hand Raised",
            description: `${data.username} has raised their hand`,
          });
          break;
      }
    }
  }, [lastMessage, toast]);

  const handleSendMessage = (message: string) => {
    const messageData = {
      type: 'chat_message',
      message,
      author: user?.firstName || 'Anonymous',
      sessionId: sessionId
    };
    
    sendMessage(messageData);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Session Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h2 className="text-white font-semibold">Introduction to Data Science - Live Session</h2>
          <Badge variant="destructive">LIVE</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participantCount} participants</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative bg-gray-900 aspect-video">
        {/* Main video feed */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <img 
            src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Live session video feed" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Video Controls Overlay */}
        <VideoControls onRaiseHand={() => {
          sendMessage({
            type: 'raise_hand',
            userId: user?.id,
            username: user?.firstName || 'Anonymous'
          });
        }} />

        {/* Participant Grid (Small view) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-black/50 backdrop-blur-sm rounded-xl p-4">
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">You</span>
            </div>
            <div className="bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">Dr. Emily</span>
            </div>
            <div className="bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">+{participantCount - 2} more</span>
            </div>
            <div className="bg-gray-700 rounded-lg flex items-center justify-center">
              <Button variant="ghost" className="text-white text-xs h-auto p-0 hover:text-blue-400">
                View All
              </Button>
            </div>
          </div>
        </div>

        {/* Session Timer */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-white text-sm">
            <Clock className="w-4 h-4" />
            <span>1:23:45</span>
          </div>
        </div>
      </div>

      {/* Chat and Additional Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-800">
        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <ChatPanel 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            currentUser={user?.firstName || 'You'}
          />
        </div>

        {/* Session Info and Breakout Rooms */}
        <div className="space-y-6">
          {/* Session Info */}
          <Card className="bg-white dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="text-gray-900 dark:text-white font-medium">1h 30m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                <span className="text-gray-900 dark:text-white font-medium">{participantCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Recording:</span>
                <span className="text-red-500 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connection:</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Connecting..."}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Breakout Rooms */}
          <Card className="bg-white dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Breakout Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Room 1', participants: 5 },
                { name: 'Room 2', participants: 4 },
                { name: 'Room 3', participants: 6 }
              ].map((room) => (
                <Button
                  key={room.name}
                  variant="ghost"
                  className="w-full justify-between p-3 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                >
                  <span className="text-gray-900 dark:text-white font-medium">{room.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{room.participants} people</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                Share Screen
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Participant List
              </Button>
              <Button variant="destructive" className="w-full">
                Leave Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
