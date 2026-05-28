
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  Timer, 
  RotateCcw, 
  ArrowLeft, 
  Zap, 
  Trophy,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const SAMPLE_TEXTS: Record<string, string> = {
  "clerk-en": "Punjab is known for its fertile soil and vibrant culture. The word Punjab means the land of five rivers. Historically, it has been at the center of many empires and has contributed significantly to the Indian economy through its agricultural excellence.",
  "clerk-pa": "ਪੰਜਾਬ ਆਪਣੀ ਉਪਜਾਊ ਮਿੱਟੀ ਅਤੇ ਜੀਵੰਤ ਸਭਿਆਚਾਰ ਲਈ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ। ਪੰਜਾਬ ਸ਼ਬਦ ਦਾ ਅਰਥ ਪੰਜ ਦਰਿਆਵਾਂ ਦੀ ਧਰਤੀ ਹੈ। ਇਤਿਹਾਸਕ ਤੌਰ 'ਤੇ, ਇਹ ਕਈ ਸਾਮਰਾਜਾਂ ਦੇ ਕੇਂਦਰ ਵਿਚ ਰਿਹਾ ਹੈ ਅਤੇ ਇਸ ਨੇ ਆਪਣੀ ਖੇਤੀਬਾੜੀ ਉੱਤਮਤਾ ਦੁਆਰਾ ਭਾਰਤੀ ਆਰਥਿਕਤਾ ਵਿਚ ਮਹੱਤਵਪੂਰਣ ਯੋਗਦਾਨ ਪਾਇਆ ਹੈ।",
  "steno-en": "Economic growth in a competitive environment requires high levels of accuracy and speed. Professional stenographers play a crucial role in maintaining administrative efficiency by capturing every nuance of official proceedings with precision and reliability."
};

export default function TypingTestArena() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const testId = id as string;
  
  const textToType = SAMPLE_TEXTS[testId] || SAMPLE_TEXTS["clerk-en"];
  const isPunjabi = testId.includes("-pa");

  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, mistakes: 0 });
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let timer: any;
    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isFinished]);

  useEffect(() => {
    if (userInput.length > 0) {
      const words = userInput.trim().split(/\s+/).length;
      const minutes = (600 - timeLeft) / 60 || 0.01;
      const wpm = Math.round(words / minutes);

      let mistakes = 0;
      userInput.split("").forEach((char, idx) => {
        if (char !== textToType[idx]) mistakes++;
      });
      const accuracy = Math.max(0, Math.round(((userInput.length - mistakes) / userInput.length) * 100)) || 100;

      setStats({ wpm, accuracy, mistakes });

      if (userInput.length >= textToType.length) {
        setIsFinished(true);
      }
    }
  }, [userInput, timeLeft, textToType]);

  const handleStart = () => {
    setIsStarted(true);
    inputRef.current?.focus();
  };

  const resetTest = () => {
    setUserInput("");
    setTimeLeft(600);
    setIsStarted(false);
    setIsFinished(false);
    setStats({ wpm: 0, accuracy: 100, mistakes: 0 });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full bg-zinc-900" onClick={() => router.push('/typing')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-headline text-3xl font-bold tracking-tight">Typing Arena</h1>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-zinc-900 border border-white/5 px-6 py-2 rounded-2xl flex items-center gap-4">
                 <div className="text-center border-r border-white/5 pr-4">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Time</p>
                    <p className="text-xl font-mono font-black text-primary">{formatTime(timeLeft)}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">WPM</p>
                    <p className="text-xl font-mono font-black text-emerald-500">{stats.wpm}</p>
                 </div>
                 <div className="text-center border-l border-white/5 pl-4">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Acc</p>
                    <p className="text-xl font-mono font-black text-accent">{stats.accuracy}%</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <div className={cn(
             "relative bg-zinc-900/50 border border-white/5 p-12 rounded-[48px] overflow-hidden min-h-[300px]",
             isPunjabi && "font-body" // Ideally Raavi font class
           )}>
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                 <Keyboard size={400} />
              </div>

              <div className="relative text-2xl font-medium leading-relaxed text-zinc-600 select-none">
                 {textToType.split("").map((char, i) => {
                    let color = "";
                    if (i < userInput.length) {
                       color = userInput[i] === char ? "text-white" : "text-destructive bg-destructive/20 rounded-sm";
                    } else if (i === userInput.length) {
                       color = "text-primary border-b-2 border-primary animate-pulse";
                    }
                    return <span key={i} className={color}>{char}</span>
                 })}
              </div>
           </div>

           <div className="relative">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => {
                  if (!isStarted) setIsStarted(true);
                  if (!isFinished) setUserInput(e.target.value);
                }}
                disabled={isFinished}
                className="w-full h-40 bg-zinc-900 border-white/10 rounded-[32px] p-8 text-xl font-medium focus:ring-primary/40 focus:border-primary/40 leading-relaxed outline-none"
                placeholder={isStarted ? "" : "Start typing to begin test..."}
              />
              
              {!isStarted && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[32px]">
                    <Button onClick={handleStart} className="h-16 px-10 rounded-2xl bg-primary text-white text-lg font-black blue-glow">
                       Click to Begin Test
                    </Button>
                 </div>
              )}
           </div>

           <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[32px]">
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-zinc-500" />
                 <p className="text-xs text-zinc-500 font-medium">Use Backspace to correct mistakes. PSSSB criteria allows for limited errors.</p>
              </div>
              <Button variant="outline" size="lg" className="rounded-xl border-white/10" onClick={resetTest}>
                 <RotateCcw className="w-4 h-4 mr-2" /> Reset Session
              </Button>
           </div>
        </div>

        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
               <div className="max-w-xl w-full bg-zinc-950 border border-primary/30 rounded-[48px] p-12 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Trophy size={200} />
                  </div>
                  
                  <Badge className="bg-primary/10 text-primary mb-6 px-4 py-1.5 rounded-full font-black text-xs uppercase">Result Summary</Badge>
                  <h2 className="text-5xl font-black mb-10 tracking-tighter">TEST COMPLETE</h2>
                  
                  <div className="grid grid-cols-3 gap-6 mb-12">
                     <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Speed</p>
                        <p className="text-3xl font-black text-emerald-500">{stats.wpm} <span className="text-xs">WPM</span></p>
                     </div>
                     <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Accuracy</p>
                        <p className="text-3xl font-black text-accent">{stats.accuracy}%</p>
                     </div>
                     <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Errors</p>
                        <p className="text-3xl font-black text-destructive">{stats.mistakes}</p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <Button className="flex-1 h-14 rounded-2xl bg-primary text-white font-black" onClick={resetTest}>
                        Try Again
                     </Button>
                     <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/10" onClick={() => router.push('/typing')}>
                        Exit Arena
                     </Button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Navbar />
    </AppLayout>
  );
}
