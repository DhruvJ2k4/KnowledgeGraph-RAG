import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { queryApi } from '@/lib/api';

/**
 * Custom hook for managing chat functionality
 * Handles sending messages, receiving responses, and managing chat history
 */
export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Send a message to the chat
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Use the API client to send the message
      const response = await queryApi.chat({
        question: content
      });

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.answer,
          timestamp: new Date(),
        };
        return [...withoutTyping, assistantMessage];
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });

      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Chat history has been cleared successfully.",
    });
  }, [toast]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
};
