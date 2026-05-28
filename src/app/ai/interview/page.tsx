
"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { conductMockInterview, InterviewSimOutput } from '@/ai/flows/interview-sim-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ShieldCheck, 
  MessageSquare, 
  Loader2, 
  Trophy, 
  ArrowRight, 
  User, 
  Bot,
  Star,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function InterviewPage() {
  const [role, setRole] = useState("Punjab Police Sub-Inspector");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [history, setHistory] = useState<{ role: 'ai' | 'user', text: string, feedback?: string, score?: number }[]>([]);
  const [complete, setComplete] = useState(false);

  async function startInterview() {
    setLoading(true);
    try {
      const result = await conductMockInterview({ role });
      setCurrentQuestion(result.aiQuestion);
      setHistory([{ role: 'ai', text: result.aiQuestion }]);
      setStarted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!userInput.trim() || loading) return;
    
    setLoading(true);
    const answer = userInput;
    setUserInput("");
    
    try {
      const result = await conductMockInterview({
        role,
        currentQuestion,
        userResponse: answer,
        history: history.map(h => ({ role: h.role, text: h.text }))
      });

      const newHistory = [...history, { role: 'user' as const, text: answer, feedback: result.feedback, score: result.score }];
      
      if (result.isComplete) {
        setComplete(true);
        setHistory(newHistory);
      } else {
        setHistory([...newHistory, { role: 'ai' as const, text: result.aiQuestion }]);
        setCurrentQuestion(result.aiQuestion);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-black text-xs uppercase tracking-[0.2em]">
              High-Stakes Simulation
            </Badge>
            <h1 className="font-headline text-5xl font-black">AI Mock Interview</h1>
            <p className="text-xl text-zinc-500 max-w-xl">
              Simulate PPSC and Punjab Police board interviews with expert-level panel feedback.
            </p>
          </div>
          <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-white/5 flex items-center justify-center blue-glow">
             <ShieldCheck className="text-primary w-10 h-10" />
          </div>
        </div>

        {!started ? (
          <Card className="rounded-[48px] cracklix-glass border-white/5 p-12 text-center space-y-8">
             <div className="w-20 h-20 rounded-[28px] bg-zinc-900 mx-auto flex items-center justify-center">
                <User className="text-zinc-500 w-10 h-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-bold">Select Target Role</h3>
                <p className="text-zinc-500 italic">"The board is waiting for you to enter the room."</p>
             </div>
             <div className="max-w-sm mx-auto space-y-4">
               <Input 
                 value={role} 
                 onChange={(e) => setRole(e.target.value)}
                 className="h-14 rounded-2xl bg-zinc-900 border-white/10 text-center text-lg font-bold"
                 placeholder="Enter Role (e.g. PCS Officer)"
               />
               <Button 
                 onClick={startInterview} 
                 disabled={loading}
                 className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <><ArrowRight className="mr-2" /> Enter Panel Room</>}
               </Button>
             </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
             <Card className="rounded-[40px] cracklix-glass border-white/5 h-[600px] flex flex-col overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                         <Bot className="text-white w-5 h-5" />
                      </div>
                      <div>
                         <CardTitle className="text-lg">PPSC Mock Panel</CardTitle>
                         <CardDescription className="text-xs">Live Simulation for {role}</CardDescription>
                      </div>
                   </div>
                   {complete && <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-black uppercase text-[10px]">Session Complete</Badge>}
                </CardHeader>
                
                <ScrollArea className="flex-1 p-8">
                   <div className="space-y-6">
                      {history.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent' : 'bg-zinc-800'}`}>
                              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                           </div>
                           <div className="max-w-[80%] space-y-3">
                              <div className={`p-5 rounded-[28px] ${msg.role === 'user' ? 'bg-accent/10 border border-accent/20 rounded-tr-none' : 'bg-white/5 border border-white/5 rounded-tl-none'}`}>
                                 <p className="text-sm leading-relaxed">{msg.text}</p>
                              </div>
                              {msg.feedback && (
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Panel Feedback</span>
                                      <div className="flex items-center gap-1">
                                         <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                         <span className="text-xs font-bold">{msg.score}/10</span>
                                      </div>
                                   </div>
                                   <p className="text-xs italic text-zinc-400">{msg.feedback}</p>
                                </div>
                              )}
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </ScrollArea>

                <div className="p-8 border-t border-white/5 bg-black/20">
                   {!complete ? (
                     <div className="flex gap-4">
                        <Input 
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type your response to the board..."
                          className="flex-1 h-14 rounded-2xl bg-zinc-900 border-white/5"
                          onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                        />
                        <Button 
                          onClick={submitAnswer} 
                          disabled={loading || !userInput.trim()}
                          className="w-14 h-14 rounded-2xl bg-primary"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                        </Button>
                     </div>
                   ) : (
                     <div className="text-center">
                        <Button variant="outline" className="rounded-xl border-white/10" onClick={() => window.location.reload()}>
                           <RotateCcw className="w-4 h-4 mr-2" /> Start New Session
                        </Button>
                     </div>
                   )}
                </div>
             </Card>
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
