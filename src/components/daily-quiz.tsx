"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DailyQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const q = query(collection(db, "dailyQuizzes"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Daily quiz load failed", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, []);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (loading) return <div className="h-48 rounded-[32px] bg-card/40 animate-pulse" />;
  if (questions.length === 0) return null;

  const currentQ = questions[current];

  return (
    <Card className="rounded-[40px] cracklix-glass overflow-hidden border-primary/20 bg-primary/5">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
            Daily Challenge
          </Badge>
          <div className="text-xs text-muted-foreground font-mono">
            {current + 1} / {questions.length}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold leading-tight">
          {currentQ.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-4 mt-6">
          {currentQ.options.map((option: string) => {
            const isSelected = selected === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            let btnClass = "bg-secondary/50 border-white/5 hover:border-white/20";
            if (showResult) {
              if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
              else if (isSelected) btnClass = "bg-destructive/20 border-destructive text-destructive";
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={showResult}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${btnClass}`}
              >
                <span className="font-medium">{option}</span>
                {showResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-8 pt-8 border-t border-white/5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="text-primary w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">
                    {selected === currentQ.correctAnswer ? "+10 XP Earned!" : "Keep learning!"}
                  </p>
                </div>
                {current < questions.length - 1 && (
                  <Button onClick={nextQuestion} className="rounded-xl h-12 bg-white text-black hover:bg-white/90 font-bold">
                    Next Challenge
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}