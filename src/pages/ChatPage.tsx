import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChatService } from '../services/ai/chat.service';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardBody, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Send, Bot, User, Lightbulb, MessageSquareText } from 'lucide-react';
import { loadSettings } from '../lib/settings';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildLocalAnswer(question: string) {
  const settings = loadSettings();
  const toneLabel =
    settings.responseTone === 'concise'
      ? 'concise'
      : settings.responseTone === 'detailed'
        ? 'detailed'
        : 'balanced';
  const summaryLabel =
    settings.summaryLength === 'short'
      ? 'short'
      : settings.summaryLength === 'long'
        ? 'long'
        : 'medium';

  return {
    answer: `I would respond in a ${toneLabel} tone and keep the answer ${summaryLabel}. For "${question}", the best next step is to review the matched documents, extract the key fields, and summarize any action items in the workspace context.`,
    sources: ['Workspace settings', 'Recent activity', 'Document library'],
    hint: settings.autoSuggestActions
      ? 'Follow-up suggestions are enabled in your AI settings.'
      : 'Follow-up suggestions are currently turned off in your AI settings.',
  };
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createId(),
      role: 'assistant',
      content: 'Ask about uploaded documents, processing status, or next steps. I can answer locally until an API key is connected.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsedMode, setLastUsedMode] = useState<'live' | 'local'>('local');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const recentPrompts = useMemo(
    () => ['Summarize my latest document.', 'What should I review next?', 'Show me a short action plan.'],
    []
  );

  const pushMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !userId) return;

    const question = query.trim();
    setLoading(true);
    setError(null);
    pushMessage({
      id: createId(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    });
    setQuery('');

    try {
      const result = await ChatService.askLibrary(null, userId, question);
      if (result.error) {
        const fallback = buildLocalAnswer(question);
        setLastUsedMode('local');
        pushMessage({
          id: createId(),
          role: 'assistant',
          content: fallback.answer,
          timestamp: new Date().toISOString(),
          sources: fallback.sources,
        });
        setError(fallback.hint + (result.error.message ? ` (${result.error.message})` : ''));
      } else {
        setLastUsedMode('live');
        pushMessage({
          id: createId(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toISOString(),
          sources: result.sources,
        });
      }
    } catch (err: any) {
      const fallback = buildLocalAnswer(question);
      setLastUsedMode('local');
      pushMessage({
        id: createId(),
        role: 'assistant',
        content: fallback.answer,
        timestamp: new Date().toISOString(),
        sources: fallback.sources,
      });
      setError(err?.message || 'Something went wrong, so a local fallback response was used.');
    } finally {
      setLoading(false);
    }
  };

  const applyPrompt = (prompt: string) => setQuery(prompt);

  const renderMessageIcon = (role: ChatMessage['role']) => {
    if (role === 'user') return <User className="h-4 w-4" />;
    if (role === 'system') return <Lightbulb className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  return (
    <PageContainer variant="medium">
      <SectionContainer spacing="md">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-slate-700" />
              <h2 className="text-2xl font-semibold text-slate-900">AI Chat</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Ask about your documents, summarize findings, or generate next steps. Until your API key is connected, this screen uses a local workspace-aware fallback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={lastUsedMode === 'live' ? 'success' : 'warning'}>
              {lastUsedMode === 'live' ? 'Live AI connected' : 'Local fallback active'}
            </Badge>
            {!userId && <Badge variant="error">Sign in required</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Conversation</p>
                <p className="mt-1 text-sm text-slate-500">Saved for this session only until persistent chat history is added.</p>
              </div>
              <Badge variant="info">Local + live ready</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm sm:p-5">
              <div className="max-h-[24rem] space-y-4 overflow-y-auto pr-1 sm:max-h-[28rem]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role !== 'user' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                        {renderMessageIcon(message.role)}
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[75%] ${message.role === 'user' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${message.role === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        {message.sources && message.sources.length > 0 && message.role === 'assistant' && (
                          <span>{message.sources.length} source{message.sources.length === 1 ? '' : 's'}</span>
                        )}
                      </div>

                      {message.sources && message.sources.length > 0 && message.role === 'assistant' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.sources.map((source) => (
                            <span key={source} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-sm">
                        {renderMessageIcon(message.role)}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleAsk} className="relative">
                <div className="flex items-stretch gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition-all duration-200 focus-within:border-slate-900 focus-within:shadow-md">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your documents…"
                    disabled={loading || !userId}
                    inline
                    aria-label="Chat question"
                    className="border-0 bg-transparent shadow-none focus:ring-0"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !query.trim() || !userId}
                    size="icon"
                    className="flex-shrink-0 rounded-xl"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recentPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => applyPrompt(prompt)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </form>

              {error && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">Fallback response used</p>
                  <p className="mt-1 text-sm text-amber-800">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
                <p className="text-sm font-semibold text-slate-900">How this chat works</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">When API key is added</p>
                    <p className="mt-1 text-sm text-slate-600">Responses will switch from local fallback to the live AI service automatically.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Settings-aware</p>
                    <p className="mt-1 text-sm text-slate-600">Tone, summary length, and safety behavior follow your saved settings.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Current mode</p>
                <p className="mt-2 text-sm text-slate-600">{lastUsedMode === 'live' ? 'Live AI is available.' : 'Local fallback is active.'}</p>
                <p className="mt-3 text-xs text-slate-500">Add your API key later and the same interface will start using the connected model without changing the page layout.</p>
              </div>
            </div>

            {!userId && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">Sign in to use AI Chat.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </SectionContainer>
    </PageContainer>
  );
};

export default ChatPage;
