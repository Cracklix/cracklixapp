"use client";

import { useState } from "react";
import { addQuestion } from "@/services/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuestionForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_en: "",
    question_pa: "",
    option1_en: "",
    option2_en: "",
    option3_en: "",
    option4_en: "",
    option1_pa: "",
    option2_pa: "",
    option3_pa: "",
    option4_pa: "",
    correctAnswer: "",
    subject: "Punjab GK",
    topic: "",
    difficulty: "medium" as const,
    marks: 1,
    pyq: false,
    year: new Date().getFullYear(),
    exam: "Punjab Police",
    qualityScore: 80,
    explanation_en: "",
    explanation_pa: "",
    status: "published" as const
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function saveQuestion() {
    if (!formData.question_en || !formData.correctAnswer) {
      toast({ title: "Error", description: "English question and correct answer are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addQuestion({
        ...formData,
        options_en: [formData.option1_en, formData.option2_en, formData.option3_en, formData.option4_en],
        options_pa: [formData.option1_pa, formData.option2_pa, formData.option3_pa, formData.option4_pa],
      });

      toast({ title: "Success", description: "Bilingual question added to bank." });
      setFormData({
        ...formData,
        question_en: "",
        question_pa: "",
        option1_en: "",
        option2_en: "",
        option3_en: "",
        option4_en: "",
        option1_pa: "",
        option2_pa: "",
        option3_pa: "",
        option4_pa: "",
        correctAnswer: "",
        explanation_en: "",
        explanation_pa: ""
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-5xl space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <PlusCircle className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Content Injection</h2>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary">v4 Production Engine</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* English Context */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Languages className="w-3 h-3 text-blue-500" /> English Content
          </h3>
          <div className="space-y-2">
            <Label>Question (EN)</Label>
            <Textarea
              name="question_en"
              value={formData.question_en}
              onChange={handleChange}
              className="min-h-[100px] bg-zinc-800/50 border-white/5 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Input 
                key={i}
                name={`option${i}_en`}
                value={(formData as any)[`option${i}_en`]}
                onChange={handleChange}
                placeholder={`Option ${i} (EN)`}
                className="bg-zinc-800/50 border-white/5 h-10 rounded-lg"
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label>Explanation (EN)</Label>
            <Textarea
              name="explanation_en"
              value={formData.explanation_en}
              onChange={handleChange}
              placeholder="Why is this correct?"
              className="min-h-[80px] bg-zinc-800/50 border-white/5 rounded-xl"
            />
          </div>
        </div>

        {/* Punjabi Context */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Languages className="w-3 h-3 text-primary" /> Punjabi Content (Raavi)
          </h3>
          <div className="space-y-2">
            <Label>ਪ੍ਰਸ਼ਨ (PA)</Label>
            <Textarea
              name="question_pa"
              value={formData.question_pa}
              onChange={handleChange}
              className="min-h-[100px] bg-zinc-800/50 border-white/5 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Input 
                key={i}
                name={`option${i}_pa`}
                value={(formData as any)[`option${i}_pa`]}
                onChange={handleChange}
                placeholder={`ਵਿਕਲਪ ${i} (PA)`}
                className="bg-zinc-800/50 border-white/5 h-10 rounded-lg"
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label>ਵਿਆਖਿਆ (PA)</Label>
            <Textarea
              name="explanation_pa"
              value={formData.explanation_pa}
              onChange={handleChange}
              placeholder="ਇਹ ਸਹੀ ਕਿਉਂ ਹੈ?"
              className="min-h-[80px] bg-zinc-800/50 border-white/5 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 grid md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <Label className="text-emerald-500">Correct Answer</Label>
          <Input
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleChange}
            placeholder="Exact match"
            className="bg-zinc-800/50 border-emerald-500/20 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(v: any) => setFormData({...formData, difficulty: v})}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quality Score</Label>
          <Input 
            type="number"
            name="qualityScore"
            value={formData.qualityScore}
            onChange={handleChange}
            className="bg-zinc-800/50 border-white/5 h-12 rounded-xl"
          />
        </div>
        <Button onClick={saveQuestion} disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Publish Question"}
        </Button>
      </div>
    </div>
  );
}
