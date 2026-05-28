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
import { SUBJECT_LIST, Subject } from "@/types";

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
    subject: "General Knowledge" as Subject,
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
    <div className="bg-zinc-900/50 border border-white/5 p-12 rounded-[48px] max-w-6xl space-y-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
         <PlusCircle size={200} />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <PlusCircle className="text-primary w-8 h-8" />
          </div>
          <div>
             <h2 className="text-3xl font-black tracking-tighter uppercase">Academic Asset Injection</h2>
             <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">v4.2 Production Content Engine</p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 font-black px-4 py-1.5 uppercase text-[10px] tracking-[0.2em]">Validated Schema</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-16 relative z-10">
        {/* English Context */}
        <div className="space-y-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Languages className="w-4 h-4 text-blue-500" />
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">English Narrative</h3>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">Question Content</Label>
            <Textarea
              name="question_en"
              value={formData.question_en}
              onChange={handleChange}
              placeholder="Formulate the atomic question in academic English..."
              className="min-h-[120px] bg-zinc-800/30 border-white/5 rounded-2xl p-6 text-sm leading-relaxed"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="relative group">
                 <span className="absolute left-4 top-3.5 text-[10px] font-black text-zinc-600 group-focus-within:text-primary transition-colors">{String.fromCharCode(64+i)}</span>
                 <Input 
                   name={`option${i}_en`}
                   value={(formData as any)[`option${i}_en`]}
                   onChange={handleChange}
                   placeholder={`English Option ${i}`}
                   className="bg-zinc-800/30 border-white/5 h-12 rounded-xl pl-10 text-sm"
                 />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">Solution Logical Path</Label>
            <Textarea
              name="explanation_en"
              value={formData.explanation_en}
              onChange={handleChange}
              placeholder="Step-by-step logic for the student..."
              className="min-h-[100px] bg-zinc-800/30 border-white/5 rounded-2xl p-6 text-sm"
            />
          </div>
        </div>

        {/* Punjabi Context */}
        <div className="space-y-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Languages className="w-4 h-4 text-primary" />
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">ਪੰਜਾਬੀ ਗੁਰਮੁਖੀ (Raavi)</h3>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">ਪ੍ਰਸ਼ਨ ਸਮੱਗਰੀ</Label>
            <Textarea
              name="question_pa"
              value={formData.question_pa}
              onChange={handleChange}
              placeholder="Formulate the atomic question in Raavi-compliant Punjabi..."
              className="min-h-[120px] bg-zinc-800/30 border-white/5 rounded-2xl p-6 text-sm leading-relaxed"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="relative">
                 <span className="absolute left-4 top-3.5 text-[10px] font-black text-zinc-600">{i}</span>
                 <Input 
                   name={`option${i}_pa`}
                   value={(formData as any)[`option${i}_pa`]}
                   onChange={handleChange}
                   placeholder={`ਵਿਕਲਪ ${i} (Punjabi)`}
                   className="bg-zinc-800/30 border-white/5 h-12 rounded-xl pl-10 text-sm"
                 />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">ਹੱਲ ਦਾ ਵੇਰਵਾ</Label>
            <Textarea
              name="explanation_pa"
              value={formData.explanation_pa}
              onChange={handleChange}
              placeholder="ਵਿਆਖਿਆ ਇੱਥੇ ਲਿਖੋ..."
              className="min-h-[100px] bg-zinc-800/30 border-white/5 rounded-2xl p-6 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 grid md:grid-cols-4 gap-8 items-end relative z-10">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Correct Terminal</Label>
          <Input
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleChange}
            placeholder="Exact English option match"
            className="bg-zinc-800/50 border-emerald-500/20 h-14 rounded-2xl font-bold px-6 shadow-lg shadow-emerald-900/5"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Subject Index</Label>
          <Select value={formData.subject} onValueChange={(v: any) => setFormData({...formData, subject: v})}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white">
              {SUBJECT_LIST.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(v: any) => setFormData({...formData, difficulty: v})}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white">
              <SelectItem value="easy">Level: Easy</SelectItem>
              <SelectItem value="medium">Level: Medium</SelectItem>
              <SelectItem value="hard">Level: Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={saveQuestion} disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-sm uppercase tracking-widest shadow-xl blue-glow">
          {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <PlusCircle className="mr-2 w-5 h-5" />}
          Finalize Injection
        </Button>
      </div>
    </div>
  );
}
