import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Hand, 
  Circle, 
  PhoneOff,
  Settings,
  Users,
  MessageSquare
} from "lucide-react";

interface VideoControlsProps {
  onRaiseHand?: () => void;
  onToggleMute?: (muted: boolean) => void;
  onToggleVideo?: (enabled: boolean) => void;
  onShareScreen?: () => void;
  onStartRecording?: () => void;
  onEndCall?: () => void;
}

export default function VideoControls({
  onRaiseHand,
  onToggleMute,
  onToggleVideo,
  onShareScreen,
  onStartRecording,
  onEndCall
}: VideoControlsProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onToggleMute?.(newMuted);
  };

  const handleVideoToggle = () => {
    const newEnabled = !isVideoEnabled;
    setIsVideoEnabled(newEnabled);
    onToggleVideo?.(newEnabled);
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    onRaiseHand?.();
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onShareScreen?.();
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    onStartRecording?.();
  };

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center space-x-3 bg-black/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        {/* Mute/Unmute */}
        <Button
          onClick={handleMuteToggle}
          size="lg"
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* Video Toggle */}
        <Button
          onClick={handleVideoToggle}
          size="lg"
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            isVideoEnabled 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-800 text-white'
          }`}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        {/* Screen Share */}
        <Button
          onClick={handleScreenShare}
          size="lg"
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            isScreenSharing
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          <Monitor className="w-5 h-5" />
        </Button>

        {/* Raise Hand */}
        <Button
          onClick={handleRaiseHand}
          size="lg"
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            handRaised
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          <Hand className="w-5 h-5" />
        </Button>

        {/* Recording */}
        <Button
          onClick={handleRecording}
          size="lg"
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            isRecording
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          <Circle className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
        </Button>

        {/* Participants */}
        <Button
          size="lg"
          className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
        >
          <Users className="w-5 h-5" />
        </Button>

        {/* Chat */}
        <Button
          size="lg"
          className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {/* Settings */}
        <Button
          size="lg"
          className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* End Call */}
        <Button
          onClick={onEndCall}
          size="lg"
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 ml-2"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center mt-3 space-x-2">
        {isMuted && (
          <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
            <MicOff className="w-3 h-3" />
            <span>Muted</span>
          </div>
        )}
        {isRecording && (
          <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
            <Circle className="w-3 h-3 animate-pulse" />
            <span>Recording</span>
          </div>
        )}
        {isScreenSharing && (
          <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
            <Monitor className="w-3 h-3" />
            <span>Sharing</span>
          </div>
        )}
        {handRaised && (
          <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
            <Hand className="w-3 h-3" />
            <span>Hand Raised</span>
          </div>
        )}
      </div>
    </div>
  );
}
