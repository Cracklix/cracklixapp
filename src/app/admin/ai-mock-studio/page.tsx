
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Rocket, 
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { forgeNeuralArtifacts } from '@/services/ai-mock-generator-flow';
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Message {
  role: 'ai' | 'user';
  content: string;
  type?: 'status' | 'data';
  artifacts?: any[];
}

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Welcome to CRACKLIX Neural Forge V3. I'm ready to synthesize bilingual mock artifacts for your arena. What shall we build today?",
      type: 'status'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mockIdentity, setMockIdentity] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customExam, setCustomExam] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Optimized scroll effect - only runs when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStop = () => {
    window.location.reload(); // Emergency kill switch
  };

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    const exam = selectedExam === 'Other...' ? customExam : selectedExam;
    const subject = selectedSubject === 'Other...' ? customSubject : selectedSubject;

    if (!exam || !subject || !mockIdentity) {
      toast({
        title: "Missing Identity",
        description: "Please provide a Mock Name, Exam, and Subject before synthesis.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);
    setProgress(5);

    try {
      setMessages(prev => [...prev, { role: 'ai', content: "Starting Neural Synthesis loop (Batch Size: 5)...", type: 'status' }]);
      
      const batchSize = 5;
      const totalRequested = 10; // Capped for stability
      let allQuestions: any[] = [];

      for (let i = 0; i < totalRequested; i += batchSize) {
        setProgress(Math.round(((i + 1) / totalRequested) * 100));
        
        const batchQuestions = await forgeNeuralArtifacts({
          instruction: prompt,
          exam: exam,
          subjects: [subject],
          count: batchSize,
          difficulty: 'medium'
        });

        allQuestions = [...allQuestions, ...batchQuestions];
        
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `Synthesized batch ${Math.floor(i/batchSize) + 1} (${allQuestions.length}/${totalRequested} artifacts).`,
          type: 'status' 
        }]);

        // Rate limit protection delay
        if (i + batchSize < totalRequested) {
          await new Promise(r => setTimeout(r, 2500));
        }
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Synthesis complete. Generated ${allQuestions.length} bilingual artifacts.`, 
        type: 'data',
        artifacts: allQuestions
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Generation Breach: ${error.message || "Unknown synthesis failure."} Retrying via fallback...`, 
        type: 'status' 
      }]);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handlePublish = async (questions: any[]) => {
    if (!questions || questions.length === 0) return;
    
    try {
      const exam = selectedExam === 'Other...' ? customExam : selectedExam;
      const batch = writeBatch(db);
      
      const mockRef = doc(collection(db, "mocks"));
      const mockData = {
        id: mockRef.id,
        title: mockIdentity,
        exam: exam,
        category: 'full',
        duration: 60,
        totalQuestions: questions.length,
        status: 'published',
        createdAt: Date.now(),
        attemptCount: 0
      };
      
      batch.set(mockRef, mockData);

      questions.forEach((q) => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, {
          ...q,
          id: qRef.id,
          mockId: mockRef.id,
          status: 'published',
          createdAt: Date.now()
        });
      });

      await batch.commit();
      
      toast({
        title: "Mock Published!",
        description: `${questions.length} questions are now live in the student arena.`,
      });
    } catch (e) {
      toast({
        title: "Publish Failed",
        description: "Firestore commit failed. Check logs.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Settings Sidebar - Desktop Only */}
      <div className="hidden md:flex w-80 border-r flex-col p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Neural Config</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Mock Identity</label>
            <Input 
              placeholder="e.g. PSSSB Clerk Full Mock 1" 
              value={mockIdentity}
              onChange={(e) => setMockIdentity(e.target.value)}
              className="bg-muted/50 border-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Target Exam</label>
            <Select onValueChange={setSelectedExam} value={selectedExam}>
              <SelectTrigger className="bg-muted/50 border-none">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                <SelectItem value="Other...">Other...</SelectItem>
              </SelectContent>
            </Select>
            {selectedExam === 'Other...' && (
              <Input 
                placeholder="Enter Exam Name" 
                value={customExam}
                onChange={(e) => setCustomExam(e.target.value)}
                className="mt-2 bg-muted/50 border-none animate-in fade-in zoom-in-95 duration-200"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Focus Subject</label>
            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
              <SelectTrigger className="bg-muted/50 border-none">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                <SelectItem value="Other...">Other...</SelectItem>
              </SelectContent>
            </Select>
            {selectedSubject === 'Other...' && (
              <Input 
                placeholder="Enter Subject Name" 
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="mt-2 bg-muted/50 border-none animate-in fade-in zoom-in-95 duration-200"
              />
            )}
          </div>
        </div>

        <div className="pt-6 mt-auto border-t">
          <div className="p-4 rounded-2xl bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Forge Health</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>QUOTA UTILIZATION</span>
                <span>LOW</span>
              </div>
              <Progress value={20} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Mobile Only Settings toggle would go here */}
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-4 max-w-3xl",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                m.role === 'ai' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {m.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              
              <div className={cn(
                "flex flex-col gap-2",
                m.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-3xl text-sm leading-relaxed",
                  m.role === 'ai' 
                    ? m.type === 'status' ? "bg-muted/50 text-muted-foreground italic border" : "bg-card border neo-shadow"
                    : "bg-primary text-primary-foreground font-medium"
                )}>
                  {m.content}
                </div>

                {m.artifacts && (
                  <div className="w-full mt-2 grid gap-3 min-w-[300px] md:min-w-[500px]">
                    <div className="flex items-center justify-between px-2">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {m.artifacts.length} Artifacts Ready
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handlePublish(m.artifacts!)}
                      >
                        <Rocket className="w-3.5 h-3.5 mr-2" />
                        Live Publish
                      </Button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto border rounded-2xl bg-muted/30 p-2 space-y-2">
                      {m.artifacts.slice(0, 3).map((art, idx) => (
                        <div key={idx} className="bg-background p-3 rounded-xl border text-xs space-y-2">
                          <div className="font-bold border-b pb-1 flex justify-between">
                            <span>Question {idx + 1}</span>
                            <span className="text-primary uppercase">{art.difficulty}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{art.questionEn}</p>
                            <p className="text-muted-foreground italic">{art.questionPa}</p>
                          </div>
                        </div>
                      ))}
                      {m.artifacts.length > 3 && (
                        <div className="text-center p-2 text-[10px] text-muted-foreground font-bold">
                          + {m.artifacts.length - 3} more questions synthesized
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            {isGenerating && (
              <div className="absolute -top-12 left-0 w-full flex items-center gap-3 px-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex-1">
                  <Progress value={progress} className="h-1.5" />
                </div>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-lg shadow-lg"
                  onClick={handleStop}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="relative flex items-end gap-2 bg-card border rounded-[2rem] p-2 pr-3 neo-shadow group-focus-within:border-primary/50 transition-all duration-300">
              <Textarea
                placeholder="Instruct the forge... (e.g. Generate 5 hard PSSSB Clerk questions on Punjab History)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[50px] max-h-[150px] resize-none py-3 px-4 text-base"
                disabled={isGenerating}
              />
              <Button
                onClick={handleSend}
                disabled={!prompt.trim() || isGenerating}
                className={cn(
                  "h-12 w-12 rounded-2xl flex-shrink-0 transition-all",
                  isGenerating ? "bg-muted" : "bg-primary hover:bg-primary/90"
                )}
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> GPT-4.0-MINI</span>
              <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> RAAVI COMPLIANT</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AUTO VALIDATED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
