
"use client";

import { useState } from "react";
import { predictSelectionRank, RankPredictorOutput } from "@/ai/flows/rank-predictor-flow";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, Loader2, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReadinessPredictor() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankPredictorOutput | null>(null);

  async function handlePredict() {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await predictSelectionRank({
        studentName: profile.name,
        examType: profile.targetExam || "Punjab Police SI",
        averageAccuracy: 78, // Mock data for demo
        mocksAttempted: 12,
        topicPerformance: { "Punjab GK": 90, "Quant": 65, "Reasoning": 82 }
      });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[40px] bg-gradient-to-br from-primary/10 via-zinc-900 to-black border-primary/20 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <BrainCircuit className="text-primary w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">AI Rank Predictor</CardTitle>
              <CardDescription>Probability based on 100k+ historical cutoffs.</CardDescription>
            </div>
          </div>
          {!result && (
            <Button 
              onClick={handlePredict} 
              disabled={loading}
              className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              {loading ? "Calculating..." : "Predict My Rank"}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-0">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Selection Prob.</p>
                  <h3 className="text-5xl font-black text-primary">{result.probability}%</h3>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Estimated Rank</p>
                  <h3 className="text-3xl font-black text-accent">{result.predictedRankRange}</h3>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
                   <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Critical Gaps</p>
                   <div className="flex flex-wrap gap-2">
                     {result.keyWeaknesses.map(w => (
                       <Badge key={w} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">{w}</Badge>
                     ))}
                   </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20">
                 <div className="flex items-center gap-3 mb-3">
                    <Target className="text-primary w-5 h-5" />
                    <h4 className="font-bold">Next 30 Days Strategy</h4>
                 </div>
                 <p className="text-sm text-zinc-400 leading-relaxed italic">
                   "{result.strategicAdvice}"
                 </p>
              </div>

              <Button variant="ghost" onClick={() => setResult(null)} className="w-full text-zinc-500 hover:text-white">
                Refresh Prediction
              </Button>
            </motion.div>
          ) : !loading && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[32px] mt-6">
               <TrendingUp className="w-12 h-12 text-zinc-500 opacity-20 mx-auto mb-4" />
               <p className="text-zinc-500 text-sm italic">Analyze your current preparation accuracy against national cutoffs.</p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
