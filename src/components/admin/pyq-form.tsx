"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, History, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECT_LIST } from "@/types";

export default function PYQForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_en: "",
    question_pa: "",
    correctAnswer: "",
    exam: "Punjab Police SI",
    year: 2024,
    subject: "General Knowledge",
    topic: "",
    options_en: ["", "", "", ""],
    options_pa: ["", "", "", ""],
    explanation_en: "",
    difficulty: "medium"
  });

  const handleOptionChange = (idx: number, lang: 'en' | 'pa', val: string) => {
    const key = lang === 'en' ? 'options_en' : 'options_pa';
    const newOptions = [...formData[key]];
    newOptions[idx] = val;
    setFormData({ ...formData, [key]: newOptions });
  };

  async function savePYQ() {
    if (!formData.question_en || !formData.correctAnswer) {
      toast({ title: "Validation Error", description: "Required fields missing.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "pyqs"), {
        ...formData,
        status: "published",
        createdAt: Date.now(),
      });

      toast({ title: "PYQ Saved", description: "Artifact injected to official bank." });
      setFormData({
        ...formData,
        question_en: "",
        question_pa: "",
        options_en: ["", "", "", ""],
        options_pa: ["", "", "", ""],
        explanation_en: ""
      });
    } catch (error: any) {
      toast({ title: "Injection Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 md:p-12 rounded-[48px] max-w-6xl space-y-12 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
         <History size={200} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center">
          <History className="text-orange-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Manual Artifact Injection</h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Direct PYQ Repository Port</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* English Content */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> English Content
          </h3>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">Question (EN)</Label>
            <Textarea
              value={formData.question_en}
              onChange={(e) => setFormData({...formData, question_en: e.target.value})}
              className="bg-zinc-800/30 border-white/5 rounded-2xl min-h-[120px] p-6 text-sm leading-relaxed"
            />
          </div>
          <div className="grid gap-4">
            {formData.options_en.map((opt, i) => (
              <div key={i} className="relative">
                <span className="absolute left-4 top-3.5 text-[10px] font-black text-zinc-600">{String.fromCharCode(65+i)}</span>
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, 'en', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65+i)}`}
                  className="bg-zinc-800/30 border-white/5 h-12 rounded-xl pl-12 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Punjabi Content */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" /> Punjabi (Raavi)
          </h3>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-zinc-600">ਪ੍ਰਸ਼ਨ (PA)</Label>
            <Textarea
              value={formData.question_pa}
              onChange={(e) => setFormData({...formData, question_pa: e.target.value})}
              className="bg-zinc-800/30 border-white/5 rounded-2xl min-h-[120px] p-6 text-sm leading-relaxed"
            />
          </div>
          <div className="grid gap-4">
            {formData.options_pa.map((opt, i) => (
              <div key={i} className="relative">
                <span className="absolute left-4 top-3.5 text-[10px] font-black text-zinc-600">{i+1}</span>
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, 'pa', e.target.value)}
                  placeholder={`ਵਿਕਲਪ ${i+1}`}
                  className="bg-zinc-800/30 border-white/5 h-12 rounded-xl pl-12 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-emerald-500">Correct Match</Label>
          <Input 
            value={formData.correctAnswer} 
            onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
            placeholder="Exact text match"
            className="bg-zinc-800/50 border-emerald-500/20 h-14 rounded-2xl px-6 font-bold"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-zinc-500">Subject Class</Label>
          <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 text-white border-white/10">
              {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-zinc-500">Cycle Year</Label>
          <Input 
            type="number" 
            value={formData.year} 
            onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
            className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl text-lg font-black"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-zinc-500">Exam Board</Label>
          <Input 
            value={formData.exam} 
            onChange={(e) => setFormData({...formData, exam: e.target.value})}
            className="bg-zinc-800/50 border-white/5 h-14 rounded-2xl font-bold"
          />
        </div>
      </div>

      <Button onClick={savePYQ} disabled={loading} className="w-full h-20 rounded-[32px] bg-orange-600 hover:bg-orange-700 text-2xl font-black blue-glow shadow-2xl transition-transform active:scale-95 shadow-orange-900/20">
        {loading ? <Loader2 className="animate-spin mr-3" /> : <PlusCircle className="mr-3" />}
        Finalize PYQ Injection
      </Button>
    </div>
  );
}
