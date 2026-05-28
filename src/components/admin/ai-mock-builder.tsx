"use client";

import { useState } from "react";
import { generateAIMock } from "@/services/ai-mock-generator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

export default function AIMockBuilder() {
  const [exam, setExam] = useState("Punjab Police");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function createMock() {
    setLoading(true);
    try {
      const result = await generateAIMock({
        exam,
        totalQuestions: 50,
      });

      toast({
        title: "AI Mock Generated",
        description: `Successfully picked ${result.questions.length} questions based on quality and priority.`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">AI Mock Generator</h2>
      </div>

      <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
        Our proprietary algorithm picks questions based on <span className="text-white font-bold">PYQ Priority</span>, 
        difficulty balancing, and syllabus weightage.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Target Exam</label>
          <Select value={exam} onValueChange={setExam}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-12 rounded-xl">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Punjab Police">Punjab Police</SelectItem>
              <SelectItem value="PSSSB Clerk">PSSSB Clerk</SelectItem>
              <SelectItem value="Punjab PCS">Punjab PCS</SelectItem>
              <SelectItem value="General Awareness">General Awareness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={createMock}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold group shadow-lg shadow-primary/20"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" />
          )}
          {loading ? "Synthesizing Question Bank..." : "Generate AI Mock"}
        </Button>
      </div>
    </div>
  );
}
