import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import VideoControls from "@/components/live-session/video-controls";
import ChatPanel from "@/components/live-session/chat-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff,
  Users, 
  Clock,
  Settings,
  Maximize,
  Minimize,
  AlertCircle,
  CheckCircle,
  XCircle,
  MicOff,
  Hand,
  User
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
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(45);
  const [sessionData, setSessionData] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'Instructor',
      message: 'Welcome to our live session! Feel free to ask questions in the chat.',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<Date>(new Date());

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

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
      setSessionDuration(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize media and join session
  useEffect(() => {
    const initializeSession = async () => {
      if (isConnected && sessionId && user) {
        // Join session via WebSocket
        sendMessage({
          type: 'join_session',
          sessionId: sessionId,
          userId: user?.id,
          username: user?.firstName || 'Anonymous'
        });

        // Initialize user media (audio/video)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          });
          setMediaStream(stream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true; // Prevent audio feedback
          }

          toast({
            title: "Media Access Granted",
            description: "Camera and microphone are ready to use.",
          });
        } catch (error) {
          console.error('Error accessing media:', error);
          toast({
            title: "Media Access Denied",
            description: "Please grant camera and microphone permissions for full functionality.",
            variant: "destructive",
          });
        }
      }
    };

    initializeSession();

    // Cleanup on unmount
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isConnected, sessionId, user, sendMessage]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        switch (data.type) {
          case 'chat_message':
            // Only add if it's not from current user (avoid duplicates)
            if (data.author !== (user?.firstName || 'Anonymous')) {
              setChatMessages(prev => [...prev, {
                id: data.id || Date.now().toString(),
                author: data.author,
                message: data.message,
                timestamp: data.timestamp
              }]);
            }
            break;
            
          case 'hand_raised':
            toast({
              title: data.handRaised ? "Hand Raised" : "Hand Lowered",
              description: `${data.username} ${data.handRaised ? 'raised their hand' : 'lowered their hand'}`,
            });
            break;
            
          case 'participant_joined':
            setParticipantCount(data.participantCount);
            toast({
              title: "Participant Joined",
              description: `${data.username} joined the session`,
            });
            break;
            
          case 'participant_left':
            setParticipantCount(data.participantCount);
            break;
            
          case 'participant_media_change':
            // Handle other participants' media state changes
            console.log(`${data.userId} ${data.mediaType} ${data.enabled ? 'enabled' : 'disabled'}`);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, toast, user]);

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      author: user?.firstName || 'Anonymous',
      message,
      timestamp: new Date().toISOString()
    };
    
    // Add to local messages immediately
    setChatMessages(prev => [...prev, newMessage]);
    
    // Send via WebSocket
    sendMessage({
      type: 'chat_message',
      ...newMessage,
      sessionId: sessionId
    });
  };

  const handleToggleMute = (muted: boolean) => {
    setIsMuted(muted);
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
    
    // Broadcast media state change
    sendMessage({
      type: 'media_state_change',
      userId: user?.id,
      mediaType: 'audio',
      enabled: !muted,
      sessionId: sessionId
    });
    
    toast({
      title: muted ? "Microphone muted" : "Microphone unmuted",
      description: muted ? "You are now muted" : "You can now speak",
    });
  };

  const handleToggleVideo = (enabled: boolean) => {
    setIsVideoEnabled(enabled);
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
    
    // Broadcast media state change
    sendMessage({
      type: 'media_state_change',
      userId: user?.id,
      mediaType: 'video',
      enabled: enabled,
      sessionId: sessionId
    });
    
    toast({
      title: enabled ? "Camera enabled" : "Camera disabled",
      description: enabled ? "Your video is now visible" : "Your video is now hidden",
    });
  };

  const handleRaiseHand = () => {
    const newHandState = !handRaised;
    setHandRaised(newHandState);
    
    // Send hand raise status via WebSocket
    sendMessage({
      type: 'raise_hand',
      userId: user?.id,
      username: user?.firstName || 'Anonymous',
      handRaised: newHandState,
      sessionId: sessionId
    });
    
    toast({
      title: newHandState ? "Hand raised" : "Hand lowered",
      description: newHandState ? "The instructor will see your raised hand" : "Hand has been lowered",
    });
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        if (mediaStream && localVideoRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = mediaStream.getVideoTracks()[0];
          
          // Stop current video track
          if (sender) sender.stop();
          
          // Add screen share track
          localVideoRef.current.srcObject = screenStream;
          setIsScreenSharing(true);
          
          // Listen for screen share end
          videoTrack.onended = () => {
            setIsScreenSharing(false);
            handleToggleVideo(isVideoEnabled); // Restore camera
          };
        }
        
        toast({
          title: "Screen sharing started",
          description: "Your screen is now being shared",
        });
      } else {
        // Stop screen sharing and restore camera
        if (mediaStream) {
          mediaStream.getVideoTracks().forEach(track => track.stop());
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: isVideoEnabled,
            audio: true
          });
          setMediaStream(newStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
          }
        }
        
        setIsScreenSharing(false);
        toast({
          title: "Screen sharing stopped",
          description: "Camera view restored",
        });
      }
    } catch (error) {
      toast({
        title: "Screen sharing failed",
        description: "Unable to start screen sharing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Session recording has been stopped" : "Session is now being recorded",
    });
  };

  const handleEndCall = () => {
    // Clean up media streams
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Send leave message
    sendMessage({
      type: 'leave_session',
      sessionId: sessionId,
      userId: user?.id
    });
    
    toast({
      title: "Session ended",
      description: "You have left the live session",
    });
    
    // Navigate back to live sessions
    setLocation('/live-sessions');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        {/* Instructor/Main Video Feed */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            poster="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
          />
          
          {/* Video overlay with session info */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
          
          {/* No video placeholder */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Connecting to session...</p>
                <p className="text-sm opacity-75">Please wait while we establish connection</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Video Controls Overlay */}
        <VideoControls 
          onRaiseHand={handleRaiseHand}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onShareScreen={handleScreenShare}
          onStartRecording={handleStartRecording}
          onEndCall={handleEndCall}
        />

        {/* Local Video (Your view) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Video status indicators */}
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {isMuted && (
              <div className="bg-red-500 rounded-full p-1">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
            {!isVideoEnabled && (
              <div className="bg-gray-600 rounded-full p-1">
                <VideoOff className="w-3 h-3 text-white" />
              </div>
            )}
            {handRaised && (
              <div className="bg-yellow-500 rounded-full p-1 animate-pulse">
                <Hand className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          {/* User name label */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-white text-xs">You</span>
          </div>
          
          {/* No video fallback */}
          {!mediaStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <User className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-xs">{user?.firstName || 'You'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Session Timer and Status */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2 text-white text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(sessionDuration)}</span>
            </div>
          </div>
          
          {/* Connection status */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2 text-white text-sm">
              {isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="bg-red-500 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2 text-white text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Recording</span>
              </div>
            </div>
          )}
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
