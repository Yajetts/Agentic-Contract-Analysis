import React from 'react';
import { User, Bot, Gavel, FileText, AlertTriangle, FileSearch, Shield } from 'lucide-react';
import { Message } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const getAgentConfig = (agent?: Message['agent']) => {
  switch (agent) {
    case 'legal':
      return {
        name: 'Legal Assistant',
        icon: Gavel,
        color: 'bg-agent-legal',
        initials: 'LA',
      };
    case 'summary':
      return {
        name: 'Summary Agent',
        icon: FileText,
        color: 'bg-agent-summary',
        initials: 'SA',
      };
    case 'redflags':
      return {
        name: 'Risk Analysis',
        icon: AlertTriangle,
        color: 'bg-agent-redflags',
        initials: 'RA',
      };
    case 'clause':
      return {
        name: 'Clause Extractor',
        icon: FileSearch,
        color: 'bg-agent-clause',
        initials: 'CE',
      };
    case 'compliance':
      return {
        name: 'Compliance Check',
        icon: Shield,
        color: 'bg-agent-compliance',
        initials: 'CC',
      };
    default:
      return {
        name: 'AI Assistant',
        icon: Bot,
        color: 'bg-primary',
        initials: 'AI',
      };
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const agentConfig = getAgentConfig(message.agent);

  return (
    <div className={cn('flex gap-3 max-w-4xl', isUser ? 'ml-auto' : 'mr-auto')}>
      {/* Avatar */}
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn('text-white text-xs font-medium', agentConfig.color)}>
            {agentConfig.initials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn('flex-1 space-y-1', isUser && 'flex flex-col items-end')}>
        {/* Agent Name */}
        {!isUser && (
          <div className="flex items-center gap-2">
            <agentConfig.icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {agentConfig.name}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'p-4 rounded-lg transition-all duration-200 max-w-full',
            isUser
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-foreground border border-border shadow-sm'
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="mb-0 leading-relaxed whitespace-pre-wrap">
              {message.agent === 'risk' ? (
                (() => {
                  try {
                    const data = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
                    if (Array.isArray(data)) {
                      return data.map((item, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          <span className="font-bold text-foreground">{item.clause_type || item["clause type"]}</span>:<br />
                          <span className="italic text-muted-foreground">"{item.exact_clause_text || item["clause text"]}"</span><br />
                          <span className="text-foreground">{item.risk_description || item["risk description"]}</span>
                        </div>
                      ));
                    }
                  } catch (e) {
                    // fall through to plain text
                  }
                  return message.content;
                })()
              ) : (
                message.content
              )}
            </p>
          </div>
          
          {/* Loading indicator */}
          {message.isLoading && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75 opacity-60" />
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150 opacity-60" />
              </div>
              <span className="text-xs text-muted-foreground">
                {agentConfig.name} is analyzing...
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={cn('text-xs text-muted-foreground', isUser && 'text-right')}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};