
"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { aiPerformanceCoachStudyPlan, AiPerformanceCoachStudyPlanOutput } from '@/ai/flows/ai-performance-coach-study-plan';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Sparkles, Send, CheckCircle2, AlertCircle, BookOpen, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample quiz data for demonstration
const SAMPLE_RESULTS = [
  { question: "What is the second law of thermodynamics?", correctAnswer: "Entropy increases in an isolated system.", userAnswer: "Energy is conserved.", isCorrect: false, topic: "Thermodynamics" },
  { question: "Define kinetic energy.", correctAnswer: "Energy of motion.", userAnswer: "Energy of motion.", isCorrect: true, topic: "Mechanics" },
  { question: "What is the speed of light in a vacuum?", correctAnswer: "299,792,458 m/s", userAnswer: "300,000,000 m/s", isCorrect: false, topic: "Optics" },
];

export default function AiCoachPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiPerformanceCoachStudyPlanOutput | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const result = await aiPerformanceCoachStudyPlan({
        studentName: profile?.name || 'Student',
        subject: 'General Physics',
        quizResults: SAMPLE_RESULTS
      });
      setPlan(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold">AI Performance Coach</h1>
              <p className="text-muted-foreground">Generative study blueprints based on your specific cognitive gaps.</p>
            </div>
          </div>
          {!plan && (
            <Button 
              size="lg" 
              className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold group"
              onClick={generatePlan}
              disabled={loading}
            >
              <Sparkles className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              {loading ? "Analyzing Performance..." : "Generate Custom Study Plan"}
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Synthesizing Learning Data</h3>
                <p className="text-muted-foreground max-w-xs">Our AI is currently mapping your weaknesses to high-yield study activities.</p>
              </div>
            </motion.div>
          ) : plan ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
            >
              {/* Main Analysis Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personalized Message */}
                <Card className="rounded-[32px] border-primary/20 bg-primary/5 overflow-hidden">
                  <CardContent className="p-8 flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">Coach's Brief</h4>
                      <p className="text-muted-foreground leading-relaxed italic">
                        "{plan.personalizedMessage}"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Identified Weaknesses & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-[32px] cracklix-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        Gaps Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.identifiedWeaknesses.map((w, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-destructive/5 border border-destructive/10 text-sm">
                          <span className="font-bold text-destructive">•</span>
                          {w}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[32px] cracklix-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-accent" />
                        High-Yield Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {plan.recommendedTopics.map((t, i) => (
                        <Badge key={i} className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 px-4 py-2 rounded-full text-sm">
                          {t}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Study Activities */}
                <div className="space-y-6">
                  <h3 className="font-headline text-2xl font-bold">Tactical Action Items</h3>
                  {plan.studyActivities.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-6 rounded-[32px] cracklix-glass border-white/5 flex gap-6 items-start hover:bg-card/80 transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                        <BookOpen className="w-6 h-6 group-hover:text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="uppercase tracking-widest text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                            {activity.type}
                          </Badge>
                          {activity.resource && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Resource: {activity.resource}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-medium leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar: Performance Context */}
              <div className="space-y-6">
                <Card className="rounded-[32px] cracklix-glass sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Context</CardTitle>
                    <CardDescription>Based on your last General Physics assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {SAMPLE_RESULTS.map((res, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Question {i+1}</span>
                            {res.isCorrect ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-destructive" />}
                          </div>
                          <p className="text-xs truncate font-medium">{res.question}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-white/5">
                      <Button variant="outline" className="w-full rounded-2xl h-12 border-primary/20 text-primary" onClick={() => setPlan(null)}>
                        Reset Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-secondary/20 rounded-[40px] border border-dashed border-white/10">
              <div className="w-20 h-20 rounded-[28px] bg-secondary flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">No active coaching session</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Click the button above to analyze your performance and receive a tactical study blueprint.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
