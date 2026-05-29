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
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXAM_LIST, SUBJECT_LIST, EXAM_CONFIG } from '@/types';
import { forgeNeuralArtifacts } from '@/services/neural-forge-v3';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  artifacts?: any[];
  status?: 'thinking' | 'done' | 'error';
}

export default function AiMockStudio() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExam, setSelectedExam] = useState(EXAM_LIST[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_LIST[0]);
  const [targetCount, setTargetCount] = useState(10);
  const [mockTitle, setMockIdentity] = useState('');
  const [duration, setDuration] = useState(60);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  // Sync subjects when exam changes
  useEffect(() => {
    const subjects = EXAM_CONFIG[selectedExam as keyof typeof EXAM_CONFIG] || SUBJECT_LIST;
    if (!subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [selectedExam]);

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
      // BATCH SYSTEM: Processing in chunks of 5 for stability
      const batchSize = 5;
      const batches = Math.ceil(targetCount / batchSize);
      let allResults: any[] = [];

      for (let i = 0; i < batches; i++) {
        const countForBatch = Math.min(batchSize, targetCount - (i * batchSize));
        
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].content = `Synthesizing Batch ${i + 1}/${batches}... (${allResults.length} artifacts cached)`;
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

        // SAFETY COOLDOWN: Mandatory 2s delay between AI batches
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      }

      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].status = 'done';
        last[last.length - 1].content = `Synthesis complete. Successfully forged ${allResults.length} high-fidelity artifacts for ${selectedExam}.`;
        return last;
      });

    } catch (error: any) {
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].status = 'error';
        last[last.length - 1].content = `Generation Interrupted: ${error.message || 'AI Core saturated'}. Try a smaller batch.`;
        return last;
      });
      toast({
        title: "Synthesis Error",
        description: error.message || "Quota reached. Please wait 60 seconds.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publishToArena = async (artifacts: any[]) => {
    try {
      const mockData = {
        title: mockTitle || `${selectedExam} Neural Mock - ${new Date().toLocaleDateString()}`,
        exam: selectedExam,
        category: 'full',
        duration: duration,
        totalQuestions: artifacts.length,
        status: 'published',
        accessType: 'pass_plus',
        languageMode: 'en_pa',
        createdAt: Date.now(),
        questions: artifacts.map((art, idx) => ({
          ...art,
          id: `q_${idx}_${Date.now()}`,
          order: idx
        }))
      };

      await addDoc(collection(db, 'mocks'), mockData);
      toast({ title: "LIVE PUBLISHED", description: "Simulation is now available for all students." });
    } catch (e) {
      toast({ title: "Publish Failed", variant: "destructive" });
    }
  };

  if (!mounted) return null;

  return (
    <AdminProtect>
      <div className="flex bg-[#020202] min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl shrink-0 z-30">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest">Neural Forge Studio</h1>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Syllabus-Aware Synthesis Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                <select 
                  value={selectedExam} 
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="bg-transparent border-none text-[9px] font-black uppercase px-3 focus:ring-0 outline-none"
                >
                  {EXAM_LIST.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                </select>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-transparent border-none text-[9px] font-black uppercase px-3 border-l border-white/5 focus:ring-0 outline-none"
                >
                  {(EXAM_CONFIG[selectedExam as keyof typeof EXAM_CONFIG] || SUBJECT_LIST).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 px-3 rounded-lg border border-white/5">
                <span className="text-[8px] font-black text-zinc-600 uppercase">Artifacts</span>
                <input 
                  type="number" 
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-10 bg-transparent border-none text-[10px] font-black text-center focus:ring-0 outline-none"
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </header>

          {/* Chat Space */}
          <ScrollArea className="flex-1 p-6 lg:p-10 no-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-32 text-center space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center shadow-2xl relative">
                       <div className="absolute inset-0 bg-blue-600/20 blur-[50px] animate-pulse rounded-full" />
                       <Bot className="w-10 h-10 text-blue-500 relative z-10" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black uppercase tracking-tighter">Command the Forge</h2>
                       <p className="text-zinc-500 max-w-sm mx-auto text-sm font-medium leading-relaxed italic">
                         "Synthesize 20 hard MCQs on Punjab Rivers for SI exam..."
                       </p>
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-6 p-6 rounded-3xl transition-all",
                      msg.role === 'user' ? "bg-white/[0.03] ml-12" : "bg-blue-600/5 mr-12 border border-blue-500/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                      msg.role === 'user' ? "bg-zinc-800 text-zinc-500" : "bg-blue-600 text-white"
                    )}>
                      {msg.role === 'user' ? <Target className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed font-medium">
                        {msg.content}
                        {msg.status === 'thinking' && (
                          <span className="ml-2 inline-flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          </span>
                        )}
                      </div>

                      {msg.artifacts && msg.artifacts.length > 0 && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-blue-500/30 text-blue-400 bg-blue-500/5 px-3 py-1">
                              {msg.artifacts.length} Artifacts Synthesized
                            </Badge>
                            {msg.status === 'done' && (
                              <Button 
                                size="sm" 
                                onClick={() => publishToArena(msg.artifacts!)}
                                className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[9px] font-black uppercase tracking-widest blue-glow"
                              >
                                <Play className="w-3 h-3 mr-2" /> ⚡ LIVE PUBLISH
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-3">
                            {msg.artifacts.slice(-3).map((art, aIdx) => (
                              <Card key={aIdx} className="p-4 bg-black/40 border-white/5 rounded-2xl">
                                <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Artifact #{aIdx + 1}</p>
                                <p className="font-bold text-sm leading-relaxed">{art.questionEn}</p>
                                <p className="text-zinc-500 italic text-xs mt-2 font-medium">{art.questionPa}</p>
                              </Card>
                            ))}
                            {msg.artifacts.length > 3 && (
                              <p className="text-center text-[9px] font-black text-zinc-700 uppercase tracking-widest pt-2">
                                +{msg.artifacts.length - 3} more artifacts in cache buffer
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={scrollRef} className="h-4" />
            </div>
          </ScrollArea>

          {/* Prompt Dock */}
          <div className="p-6 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 shrink-0">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex gap-4">
                 <div className="flex-1 space-y-1">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-4">Simulation Identity</span>
                    <Input 
                      placeholder="e.g. Daily Express #42"
                      value={mockTitle}
                      onChange={e => setMockIdentity(e.target.value)}
                      className="h-12 bg-white/[0.03] border-white/5 rounded-2xl px-6 font-bold text-xs"
                    />
                 </div>
                 <div className="w-32 space-y-1">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-4">Timer (Min)</span>
                    <Input 
                      type="number"
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="h-12 bg-white/[0.03] border-white/5 rounded-2xl px-6 text-center font-black text-xs"
                    />
                 </div>
              </div>

              <div className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Command the forge... (e.g. Generate 20 MCQs for PSSSB Clerk)"
                  className="bg-white/[0.05] border-white/5 h-16 pl-6 pr-24 rounded-3xl font-bold text-sm focus:ring-blue-500/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  disabled={isGenerating}
                />
                <div className="absolute right-2 top-2 flex gap-1">
                   {isGenerating ? (
                     <Button 
                       onClick={handleStop}
                       variant="ghost" 
                       className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-500/10"
                     >
                       <XCircle className="w-6 h-6" />
                     </Button>
                   ) : (
                     <Button 
                       onClick={handleGenerate}
                       disabled={!prompt.trim()}
                       className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-500"
                     >
                       <Send className="w-5 h-5" />
                     </Button>
                   )}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 pt-2">
                 <div className="flex items-center gap-1.5 opacity-40">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Syllabus Mapping Active</span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-40">
                    <RefreshCw size={10} className="text-blue-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Batching v3: Stable</span>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
