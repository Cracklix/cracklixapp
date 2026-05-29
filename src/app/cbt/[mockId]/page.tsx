'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Save, 
  Pause, 
  Play,
  Globe,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  LogOut,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Question {
  id: string;
  questionEn: string;
  questionPa: string;
  options: { en: string; pa: string }[];
  answer: number;
}

export default function CBTPlayer() {
  const { mockId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, 'unseen' | 'visited' | 'answered' | 'marked'>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isPaused, setIsPaused] = useState(false);
  const [lang, setLang] = useState<'en' | 'pa'>('en');
  const [isLoading, setIsLoading] = useState(true);
  
  // UseEffect Fix: Strict dependency array
  useEffect(() => {
    async function loadMock() {
      try {
        const mockRef = doc(db, 'mocks', mockId as string);
        const mockSnap = await getDoc(mockRef);
        if (mockSnap.exists()) {
          const data = mockSnap.data();
          setQuestions(data.questions || []);
          setTimeLeft(data.duration * 60 || 3600);
          
          const initialStatus: Record<number, any> = {};
          (data.questions || []).forEach((_: any, i: number) => {
            initialStatus[i] = 'unseen';
          });
          setStatus(initialStatus);
        }
      } catch (err) {
        toast.error('Failed to load mock');
      } finally {
        setIsLoading(false);
      }
    }
    loadMock();
  }, [mockId]);

  // UseEffect Fix: Correct Timer logic
  useEffect(() => {
    if (isPaused || timeLeft <= 0 || isLoading) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused, timeLeft, isLoading]);

  // UseEffect Fix: Optimized Heartbeat (30s) to prevent preview lag
  useEffect(() => {
    if (isLoading || isPaused) return;

    const heartbeat = setInterval(async () => {
      try {
        await setDoc(doc(db, 'attempts', `${mockId}_current`), {
          timeLeft,
          userAnswers,
          status,
          lastSync: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Heartbeat failed');
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [mockId, timeLeft, userAnswers, status, isLoading, isPaused]);

  const handleOptionSelect = (optIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
    setStatus(prev => ({ ...prev, [currentIndex]: 'answered' }));
  };

  const handleNavigate = (idx: number) => {
    if (status[currentIndex] === 'unseen') {
      setStatus(prev => ({ ...prev, [currentIndex]: 'visited' }));
    }
    setCurrentIndex(idx);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Arena...</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden text-foreground">
      {/* Testbook Style Top Bar */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <LogOut className="w-4 h-4 mr-2" /> Exit
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <h1 className="font-bold text-sm tracking-tight truncate max-w-[300px]">
            PSSSB CLERK - FULL MOCK 12
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-primary/20">
            <Timer className={cn("w-4 h-4", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-primary")} />
            <span className="font-mono font-bold text-sm tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
              className="h-8 rounded-full"
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'pa' : 'en')}
              className="h-8 rounded-full min-w-[80px]"
            >
              <Globe className="w-4 h-4 mr-2 text-blue-400" />
              {lang === 'en' ? 'ENGLISH' : 'PUNJABI'}
            </Button>
          </div>

          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 h-8 rounded-full px-6 shadow-md">
            SUBMIT TEST
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Institutional Left Palette */}
        <aside className="w-80 border-r bg-card/50 flex flex-col shadow-inner">
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <div className="w-3 h-3 bg-muted border rounded" /> Unseen
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <div className="w-3 h-3 bg-blue-600 rounded" /> Answered
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <div className="w-3 h-3 bg-red-600 rounded" /> Not Ans
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <div className="w-3 h-3 bg-purple-600 rounded" /> Marked
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleNavigate(i)}
                  className={cn(
                    "h-10 text-xs font-bold rounded-md transition-all border-2 flex items-center justify-center",
                    currentIndex === i ? "border-primary scale-110 shadow-lg z-10" : "border-transparent",
                    status[i] === 'unseen' && "bg-muted text-muted-foreground",
                    status[i] === 'visited' && "bg-red-600 text-white",
                    status[i] === 'answered' && "bg-blue-600 text-white",
                    status[i] === 'marked' && "bg-purple-600 text-white"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* 0-Scroll Question Terminal */}
        <div className="flex-1 flex flex-col bg-muted/10 relative">
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-bold px-3 py-1">
                  QUESTION {currentIndex + 1}
                </Badge>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">+1.0</Badge>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">-0.25</Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div className={cn("p-6 bg-card rounded-xl border shadow-sm", lang === 'pa' ? 'text-right' : 'text-left')}>
                  <p className={cn("text-xl font-medium leading-relaxed", lang === 'pa' ? 'font-raavi' : 'font-sans')}>
                    {lang === 'en' ? currentQuestion.questionEn : currentQuestion.questionPa}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      className={cn(
                        "group flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                        userAnswers[currentIndex] === i 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-transparent bg-card"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0",
                        userAnswers[currentIndex] === i ? "bg-primary text-primary-foreground border-primary" : "border-muted group-hover:border-primary/50"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={cn("text-lg", lang === 'pa' ? 'font-raavi text-right flex-1' : 'font-sans')}>
                        {lang === 'en' ? opt.en : opt.pa}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Institutional Navigation Dock */}
          <footer className="h-20 bg-card border-t flex items-center justify-between px-8 shadow-2xl">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-10 rounded-full border-purple-500 text-purple-500 hover:bg-purple-50"
                onClick={() => setStatus(prev => ({ ...prev, [currentIndex]: 'marked' }))}
              >
                <Flag className="w-4 h-4 mr-2" /> Mark for Review
              </Button>
              <Button 
                variant="outline" 
                className="h-10 rounded-full"
                onClick={() => {
                  const newAnswers = { ...userAnswers };
                  delete newAnswers[currentIndex];
                  setUserAnswers(newAnswers);
                  setStatus(prev => ({ ...prev, [currentIndex]: 'visited' }));
                }}
              >
                Clear Response
              </Button>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-10 rounded-full px-6"
                disabled={currentIndex === 0}
                onClick={() => handleNavigate(currentIndex - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                className="h-10 rounded-full px-8 bg-blue-600 hover:bg-blue-700 shadow-lg"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    handleNavigate(currentIndex + 1);
                  }
                }}
              >
                Save & Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </footer>
        </div>
      </main>

      {/* Pause Overlay - Simplified for speed */}
      <AnimatePresence>
        {isPaused && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
            <Card className="w-80 border-primary/20 bg-card">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Pause className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Test Paused</h3>
                  <p className="text-sm text-muted-foreground">Your progress is safely stored in our neural core.</p>
                </div>
                <Button className="w-full h-12 rounded-full" onClick={() => setIsPaused(false)}>
                  Resume Simulation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
