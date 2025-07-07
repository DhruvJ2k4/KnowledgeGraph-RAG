import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Chat Interface Component
 * Provides an interactive chat interface for querying the knowledge graph
 */
export const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const { status } = useKnowledgeGraph();
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isKnowledgeGraphReady = status.status === 'ready';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isKnowledgeGraphReady && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 px-4 py-2">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-sm text-muted-foreground">Retrieving Knowledge...</span>
    </div>
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">KG-RAG Retriever</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            isKnowledgeGraphReady 
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-500/20 text-gray-400"
          )}>
            {isKnowledgeGraphReady ? 'Online' : 'Offline'}
          </span>
          
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {!isKnowledgeGraphReady ? (
          // Disabled State
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Ready to help!</h4>
                <p className="text-muted-foreground max-w-md">
                  Build your knowledge graph first to start chatting.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Active Chat
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Start a conversation</h4>
                  <p className="text-muted-foreground">
                    Ask questions about your uploaded documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2 space-y-1",
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border'
                        )}
                      >
                        {message.isTyping ? (
                          <TypingIndicator />
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Build knowledge graph to start chatting..."
                  disabled={!isKnowledgeGraphReady || isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || !isKnowledgeGraphReady || isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  Send
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
