"use client";

import { useState, useRef, useEffect } from 'react';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Send, Sparkles, Loader2, Bot, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type Message = {
  role: 'user' | 'ai';
  content: string;
  id: string;
  suggestedTopics?: string[];
};

export default function AiChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await askAiTutor({ message: input });
      const aiMessage: Message = {
        role: 'ai',
        content: result.reply,
        id: (Date.now() + 1).toString(),
        suggestedTopics: result.suggestedTopics,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Tutor Error:", error);
      const errorMessage: Message = {
        role: 'ai',
        content: "Sorry, I encountered an issue processing your request. Please try again.",
        id: (Date.now() + 1).toString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-[40px] cracklix-glass h-[700px] flex flex-col overflow-hidden border-primary/20 bg-primary/5">
      <CardHeader className="p-8 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">AI Tutor</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary/70">Powered by Gemini 2.5 Flash</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl border border-white/5" onClick={() => setMessages([])}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50"
            >
              <div className="w-16 h-16 rounded-[24px] bg-secondary flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">How can I help you today?</h3>
                <p className="text-sm max-w-xs">Ask me about Punjab History, Reasoning tricks, or current exam patterns.</p>
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-accent' : 'bg-primary'}`}>
                {m.role === 'user' ? <User className="text-accent-foreground w-5 h-5" /> : <Bot className="text-white w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-5 rounded-[28px] ${m.role === 'user' ? 'bg-accent/10 border border-accent/20 rounded-tr-none' : 'bg-secondary/50 border border-white/5 rounded-tl-none'}`}>
                <div className="prose prose-invert prose-sm text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
                {m.suggestedTopics && m.suggestedTopics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.suggestedTopics.map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] uppercase border-primary/20 text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setInput(t)}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Loader2 className="text-white w-5 h-5 animate-spin" />
              </div>
              <div className="bg-secondary/50 border border-white/5 p-5 rounded-[28px] rounded-tl-none italic text-muted-foreground text-sm">
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <div className="p-8 border-t border-white/5 bg-black/20">
        <div className="relative">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your doubt here..."
            className="min-h-[60px] max-h-[200px] rounded-3xl bg-zinc-900 border-white/10 pr-16 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="absolute right-3 bottom-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-[0.2em] font-black">
          CRACKLIX AI can make mistakes. Verify important facts.
        </p>
      </div>
    </Card>
  );
}
