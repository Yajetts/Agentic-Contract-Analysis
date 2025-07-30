import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/store/chatStore';
import { chatAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, activeDocument, isLoading } = useChatStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSubmitting || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsSubmitting(true);

    // Add user message
    addMessage({
      content: userMessage,
      type: 'user',
    });

    // Add loading agent message
    addMessage({
      content: 'Let me analyze that for you...',
      type: 'agent',
      agent: 'legal',
      isLoading: true,
    });

    try {
      const response = await chatAPI.sendMessage({
        message: userMessage,
        document_id: activeDocument?.id,
        agent_type: 'summary', // Use a supported agent type
      });

      // Add agent response
      addMessage({
        content: response.response,
        type: 'agent',
        agent: 'legal',
      });

    } catch (error) {
      console.error('Chat message failed:', error);
      addMessage({
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'agent',
        agent: 'legal',
      });
      
      toast({
        title: "Message failed",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120; // Approximately 5 lines
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeDocument
                  ? "Ask a question about your contract..."
                  : "Ask me anything about legal documents, or upload a contract to analyze..."
              }
              disabled={disabled || isSubmitting || isLoading}
              className={`
                min-h-[44px] max-h-[120px] resize-none
                bg-background border-border
                focus:ring-primary focus:border-primary
                placeholder:text-muted-foreground
                rounded-lg
              `}
              rows={1}
            />
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || disabled || isSubmitting || isLoading}
            className="shrink-0 h-11 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!activeDocument && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Upload a legal contract to start your analysis
          </p>
        )}
      </form>
    </div>
  );
};