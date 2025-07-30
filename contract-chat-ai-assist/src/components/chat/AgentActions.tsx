import React from 'react';
import { FileText, AlertTriangle, FileSearch, Shield, Gavel, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useChatStore } from '@/store/chatStore';
import { chatAPI } from '@/services/api';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface AgentAction {
  id: 'ambiguity' | 'framework' | 'summary' | 'obligation' | 'risk';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  prompt: string;
}

const agentActions: AgentAction[] = [
  {
    id: 'ambiguity',
    name: 'Ambiguity Detector',
    description: 'Detect ambiguous language and suggest improvements',
    icon: AlertTriangle,
    color: 'bg-agent-redflags',
    prompt: 'Identify ambiguous sentences, words, or phrases in this contract. Explain why they are ambiguous and suggest clearer alternatives.',
  },
  {
    id: 'framework',
    name: 'Framework Analyzer',
    description: 'Map governing law provisions and identify conflicts',
    icon: Gavel,
    color: 'bg-agent-legal',
    prompt: 'Map and interpret governing law provisions across jurisdictions. Identify potential conflicts and harmonization requirements.',
  },
  {
    id: 'summary',
    name: 'Summarizer',
    description: 'Summarize the contract and extract key details',
    icon: FileText,
    color: 'bg-agent-summary',
    prompt: 'Summarize this contract, providing important details, keywords, and brief explanations for each section.',
  },
  {
    id: 'obligation',
    name: 'Deadline & Obligation Tracker',
    description: 'Extract deadlines, obligations, and critical dates',
    icon: FileSearch,
    color: 'bg-agent-clause',
    prompt: 'Extract all critical dates, deliverables, deadlines, and obligations from this contract, such as payment dates and contract durations.',
  },
  {
    id: 'risk',
    name: 'Risk Assessment Agent',
    description: 'Identify and explain risky clauses in the contract',
    icon: Shield,
    color: 'bg-agent-compliance',
    prompt: 'Analyze the contract and identify clauses that may pose potential risks, following strict output constraints.',
  },
];

interface AgentActionsProps {
  disabled?: boolean;
}

export const AgentActions: React.FC<AgentActionsProps> = ({ disabled = false }) => {
  const { addMessage, activeDocument, isLoading, messages } = useChatStore();
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [showRephrase, setShowRephrase] = React.useState(false);
  const [ambiguityOutput, setAmbiguityOutput] = React.useState<string | null>(null);

  const handleAgentAction = async (action: AgentAction) => {
    if (!activeDocument) {
      toast({
        title: "No document selected",
        description: "Please upload a document first to use agent actions.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAction(action.id);

    // Add user message
    addMessage({
      content: action.prompt,
      type: 'user',
    });

    // Add loading agent message
    const loadingMessageId = crypto.randomUUID();
    addMessage({
      content: `Analyzing document with ${action.name}...`,
      type: 'agent',
      agent: action.id,
      isLoading: true,
    });

    try {
      const response = await chatAPI.analyzeDocument(activeDocument.id, action.id);
      addMessage({
        content: response.response,
        type: 'agent',
        agent: action.id,
      });
      // If ambiguity agent, show follow-up
      if (action.id === 'ambiguity') {
        setAmbiguityOutput(response.response);
        setShowRephrase(true);
        addMessage({
          content: 'Would you like me to rephrase your contract with nonambiguous terms?',
          type: 'agent',
          agent: 'ambiguity',
        });
      }
    } catch (error) {
      console.error('Agent action failed:', error);
      addMessage({
        content: `Sorry, I encountered an error while analyzing the document. Please try again.`,
        type: 'agent',
        agent: action.id,
      });
      toast({
        title: "Analysis failed",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRephraseDownload = async () => {
    if (!activeDocument || !ambiguityOutput) return;
    try {
      // Fetch original contract text
      const originalText = await chatAPI.getContractText(activeDocument.id);
      // Call backend to rewrite and get PDF
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
      setShowRephrase(false);
    } catch (error) {
      alert('Failed to rephrase and download contract.');
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h3 className="font-semibold text-sm">Agent Actions</h3>
          <p className="text-xs text-muted-foreground">
            Choose an agent to analyze your document
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {agentActions.map((action) => {
            const Icon = action.icon;
            const isActionLoading = loadingAction === action.id;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                disabled={disabled || isLoading || !activeDocument || isActionLoading}
                onClick={() => handleAgentAction(action)}
                className={`
                  h-auto p-3 flex flex-col items-center space-y-2 text-center
                  hover:bg-muted transition-all duration-200 border-border
                  ${!activeDocument ? 'opacity-50' : ''}
                `}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  {isActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="font-medium text-xs text-center">{action.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight text-center break-words whitespace-normal w-36">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {!activeDocument && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              Upload a document to enable agent actions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};