import React, { useState, useRef, useEffect } from 'react';

export default function DocumentChat({ document }: { document: any }) {
  const [messages, setMessages] = useState<{ from: 'user'|'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'assistant', text: `Stub reply: ${text}` }]);
    }, 600);
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium">Contextual Chat</h5>
        <button onClick={() => setCollapsed((c) => !c)} className="text-xs text-slate-500">{collapsed ? 'Expand' : 'Collapse'}</button>
      </div>

      <div ref={listRef} className={`flex-1 overflow-auto space-y-2 ${collapsed ? 'hidden' : ''}`}>
        {messages.length === 0 && <p className="text-xs text-slate-500">Ask something about this document. (Stub)</p>}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-full md:max-w-[18rem] px-3 py-2 rounded-lg ${m.from === 'user' ? 'bg-slate-100 self-end ml-auto' : 'bg-blue-50'}`}>
            <p className="text-sm">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 sticky bottom-0 bg-transparent pt-2">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this document..."
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={send} className="rounded-md bg-slate-900 text-white px-3 py-2 text-sm">Send</button>
        </div>
      </div>
    </div>
  );
}
