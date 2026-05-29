'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Loader2, 
  Trash2, 
  Play, 
  Database, 
  Plus, 
  Layout, 
  Target, 
  RefreshCw, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { forgeNeuralArtifacts } from '@/services/neural-forge-v3';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  artifacts?: any[];
  status?: 'thinking' | 'done' | 'error';
}

export default function AiMockStudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExam, setSelectedExam] = useState(EXAM_LIST[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_LIST[0]);
  const [targetCount, setTargetCount] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // STABILITY FIX: Ensure smooth scroll doesn't trigger layout thrashing
  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  const handleStop = () => {
    window.location.reload();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    const assistantMsg: Message = { 
      role: 'assistant', 
      content: 'Initiating Neural Synthesis...', 
      status: 'thinking' 
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      // BATCH SYSTEM: Processing 10 questions in chunks of 5
      const batches = Math.ceil(targetCount / 5);
      let allResults: any[] = [];

      for (let i = 0; i < batches; i++) {
        const countForBatch = Math.min(5, targetCount - (i * 5));
        
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].content = `Synthesizing Batch ${i + 1}/${batches}...`;
          return last;
        });

        const batchResults = await forgeNeuralArtifacts({
          instruction: prompt,
          exam: selectedExam,
          subjects: [selectedSubject],
          count: countForBatch,
          difficulty: 'medium'
        });

        allResults = [...allResults, ...batchResults];
        
        // PROGRESSIVE UPDATE
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].artifacts = allResults;
          return last;
        });

        // SAFETY COOLDOWN: Prevent 429
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      }

      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].status = 'done';
        last[last.length - 1].content = `Successfully generated ${allResults.length} high-fidelity artifacts for ${selectedExam}.`;
        return last;
      });

    } catch (error: any) {
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].status = 'error';
        last[last.length - 1].content = `Generation Breach: ${error.message || 'AI Core Overload'}.`;
        return last;
      });
      toast({
        title: "Synthesis Error",
        description: "AI Quota exceeded. Please try again in a few seconds.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publishToArena = async (artifacts: any[]) => {
    try {
      const mockData = {
        title: `${selectedExam} AI Mock - ${new Date().toLocaleDateString()}`,
        exam: selectedExam,
        category: 'full',
        duration: targetCount * 1.5,
        totalQuestions: artifacts.length,
        status: 'published',
        createdAt: Date.now(),
        questions: artifacts
      };

      await addDoc(collection(db, 'mocks'), mockData);
      toast({ title: "Live Published", description: "Mock is now available for students." });
    } catch (e) {
      toast({ title: "Publish Failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#050505] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold tracking-tight">NEURAL FORGE V3</h1>
            <p className="text-xs text-zinc-500 font-medium">Conversational Artifact Synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedExam} 
            onChange={(e) => setSelectedExam(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {EXAM_LIST.map(exam => <option key={exam} value={exam}>{exam}</option>)}
          </select>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {SUBJECT_LIST.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <Input 
            type="number" 
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            className="w-16 h-8 bg-zinc-900 border-zinc-800 text-xs"
            min={1}
            max={50}
          />
        </div>
      </div>

      {/* Chat Space */}
      <ScrollArea className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-headline font-bold">What are we building today?</h2>
                <p className="text-zinc-500 max-w-sm">Command the forge to generate high-fidelity, bilingual Punjab exam MCQs with detailed logic.</p>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex gap-4 p-4 rounded-2xl",
                  msg.role === 'user' ? "bg-zinc-900/50 ml-12" : "bg-blue-600/5 mr-12 border border-blue-500/10"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-zinc-800" : "bg-blue-600"
                )}>
                  {msg.role === 'user' ? <Target className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    {msg.content}
                    {msg.status === 'thinking' && (
                      <span className="ml-2 inline-flex gap-1">
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                      </span>
                    )}
                  </div>

                  {msg.artifacts && msg.artifacts.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                          {msg.artifacts.length} Artifacts Synthesized
                        </Badge>
                        {msg.status === 'done' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            className="h-7 text-[10px] bg-blue-600 hover:bg-blue-500"
                            onClick={() => publishToArena(msg.artifacts!)}
                          >
                            <Play className="w-3 h-3 mr-1" /> ⚡ LIVE PUBLISH
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {msg.artifacts.slice(-3).map((art, aIdx) => (
                          <div key={aIdx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px]">
                            <p className="font-bold text-blue-400 mb-1">Q. {art.questionEn}</p>
                            <p className="text-zinc-400 italic">{art.questionPa}</p>
                          </div>
                        ))}
                        {msg.artifacts.length > 3 && (
                          <p className="text-center text-[10px] text-zinc-600">+{msg.artifacts.length - 3} more questions in bank...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.status === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>{msg.content}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <div className="p-4 bg-[#0a0a0a] border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Command the forge..."
              className="bg-zinc-900 border-zinc-800 h-12 pl-4 pr-12 focus-visible:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={isGenerating}
            />
            {isGenerating ? (
              <Button 
                onClick={handleStop}
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1.5 h-9 w-9 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1.5 h-9 w-9 text-blue-500 hover:bg-blue-500/10"
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 border-zinc-800 hover:bg-zinc-900"
            onClick={() => setMessages([])}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-zinc-600 mt-2">
          Neural Forge respects board syllabus and bilingual standards. Verify all high-stakes artifacts before publishing.
        </p>
      </div>
    </div>
  );
}
