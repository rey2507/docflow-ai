import React, { useState } from 'react';
import { ChatService } from '../services/ai/chat.service';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Send, Sparkles } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !userId) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    setError(null);

    try {
      const result = await ChatService.askLibrary(null, userId, query.trim());
      if (result.error) {
        setError(result.error.message || 'Failed to get answer');
      } else {
        setAnswer(result.answer);
        setSources(result.sources);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer variant="medium">
      <SectionContainer spacing="md">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">AI Chat</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ask questions about your documents. The AI searches your library using semantic similarity.
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleAsk} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about your documents…"
                  disabled={loading || !userId}
                  className="flex-1"
                  aria-label="Chat question"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !query.trim() || !userId}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Ask
                </Button>
              </div>
            </form>

            {loading && (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-800">Unable to answer</p>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
              </div>
            )}

            {answer && !loading && (
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <Sparkles className="h-4 w-4 text-violet-700" />
                  </div>
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm leading-relaxed text-slate-800">{answer}</p>
                  </div>
                </div>

                {sources.length > 0 && (
                  <div className="ml-11">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!userId && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
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
