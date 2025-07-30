import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentActions } from './AgentActions';
import { DocumentUpload } from './DocumentUpload';
import { useChatStore } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import axios from 'axios';
import { chatAPI } from '@/services/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ChatInterface: React.FC = () => {
  const { messages, activeDocument } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to format risk agent output for PDF
  const formatRiskOutput = (content: string): string => {
    try {
      const data = typeof content === 'string' ? JSON.parse(content) : content;
      if (Array.isArray(data)) {
        return data.map((item, idx) => {
          const clauseType = item.clause_type || item["clause type"];
          const clauseText = item.exact_clause_text || item["clause text"];
          const riskDescription = item.risk_description || item["risk description"];
          
          return `${clauseType}:\n"${clauseText}"\n${riskDescription}\n`;
        }).join('\n');
      }
    } catch (e) {
      // fall through to original content
    }
    return content;
  };

  const handleDownloadPDF = async () => {
    if (!activeDocument) return;
    // Collect agent outputs for the current document
    const agentNames: string[] = [];
    const outputs: string[] = [];
    messages.forEach((msg) => {
      if (msg.type === 'agent' && msg.agent && msg.content) {
        agentNames.push(msg.agent.charAt(0).toUpperCase() + msg.agent.slice(1));
        // Format risk agent output for PDF
        const formattedContent = msg.agent === 'risk' ? formatRiskOutput(msg.content) : msg.content;
        outputs.push(formattedContent);
      }
    });
    if (outputs.length === 0) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export-pdf/${activeDocument.id}`,
        { outputs, agent_names: agentNames },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_${activeDocument.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export PDF.');
    }
  };

  // Find the latest ambiguity output and check for follow-up
  const lastAmbiguityMsg = messages
    .filter((msg) => msg.agent === 'ambiguity' && msg.type === 'agent' && msg.content && !msg.isLoading)
    .slice(-2);
  const ambiguityOutput = lastAmbiguityMsg.length > 1 ? lastAmbiguityMsg[0].content : null;
  const showRephrase = lastAmbiguityMsg.length > 1 && lastAmbiguityMsg[1].content?.includes('Would you like me to rephrase your contract');

  const handleRephraseDownload = async () => {
    if (!activeDocument || !ambiguityOutput) return;
    try {
      // Fetch original contract text
      const originalText = await chatAPI.getContractText(activeDocument.id);
      // Call backend to rewrite and get PDF
      const response = await axios.post(
        `${API_BASE_URL}/rewrite-contract/${activeDocument.id}`,
        { original_text: originalText, ambiguities_output: ambiguityOutput },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rephrased_contract_${activeDocument.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to rephrase and download contract.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Agentic Document Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  {activeDocument 
                    ? `Analyzing: ${activeDocument.name}`
                    : ''
                  }
                </p>
              </div>
            </div>
            
            {activeDocument && (
              <div className="text-right">
                <div className="text-sm font-medium">{messages.length} messages</div>
                <div className="text-xs text-muted-foreground">
                  {activeDocument.type.toUpperCase()} • {(activeDocument.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold"></h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    
                  </p>
                </div>
                
                <DocumentUpload />
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {/* Download PDF Button */}
            {messages.length > 0 && activeDocument && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                  Download PDF
                </button>
              </div>
            )}

            {/* Rephrase & Download Button */}
            {showRephrase && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleRephraseDownload}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                  Download Rephrased Contract
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Agent Actions */}
      {activeDocument && <AgentActions />}

      {/* Chat Input */}
      <ChatInput />
    </div>
  );
};