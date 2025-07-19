import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Users, Hand } from "lucide-react";

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  isInstructor?: boolean;
  type?: 'message' | 'hand_raised' | 'system';
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: string;
  disabled?: boolean;
}

export default function ChatPanel({ messages, onSendMessage, currentUser, disabled = false }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || disabled) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timestamp;
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'hand_raised':
        return <Hand className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessageColor = (author: string, isInstructor?: boolean) => {
    if (isInstructor) return 'from-purple-500 to-purple-600';
    if (author === currentUser) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-gray-800">
      <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Live Chat</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3 group">
                  {/* Avatar */}
                  <div className={`w-8 h-8 bg-gradient-to-r ${getMessageColor(msg.author, msg.isInstructor)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-semibold">
                      {msg.author.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {msg.author}
                      </span>
                      {msg.isInstructor && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          Instructor
                        </Badge>
                      )}
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatTime(msg.timestamp)}
                      </span>
                      {getMessageIcon(msg.type)}
                    </div>
                    <p className={`text-sm break-words ${
                      msg.type === 'system' 
                        ? 'text-gray-600 dark:text-gray-400 italic' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {msg.message}
                    </p>
                  </div>

                  {/* Message Actions (visible on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Could add reply, react, etc. buttons here */}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Chat is disabled" : "Type your message..."}
              disabled={disabled}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || disabled}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
