
"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, History, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PYQForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_en: "",
    question_pa: "",
    correctAnswer: 0,
    exam: "Punjab Police SI",
    year: 2023,
    subject: "Punjab GK",
    topic: "",
    options_en: ["", "", "", ""],
    options_pa: ["", "", "", ""],
    explanation: ""
  });

  const handleOptionChange = (idx: number, lang: 'en' | 'pa', val: string) => {
    const key = lang === 'en' ? 'options_en' : 'options_pa';
    const newOptions = [...formData[key]];
    newOptions[idx] = val;
    setFormData({ ...formData, [key]: newOptions });
  };

  async function savePYQ() {
    if (!formData.question_en || !formData.question_pa) {
      toast({ title: "Error", description: "Questions in both languages are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "pyqs"), {
        ...formData,
        correctAnswer: Number(formData.correctAnswer),
        createdAt: Date.now(),
      });

      toast({ title: "PYQ Saved", description: "Authentic PYQ indexed for student bank." });
      setFormData({
        ...formData,
        question_en: "",
        question_pa: "",
        explanation: ""
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-4xl space-y-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <History className="text-orange-500 w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Previous Year Question CMS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* English Content */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> English Content
          </h3>
          <div className="space-y-2">
            <Label>Question (EN)</Label>
            <Textarea
              value={formData.question_en}
              onChange={(e) => setFormData({...formData, question_en: e.target.value})}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-24"
            />
          </div>
          {formData.options_en.map((opt, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-[10px]">Option {String.fromCharCode(65+i)}</Label>
              <Input
                value={opt}
                onChange={(e) => handleOptionChange(i, 'en', e.target.value)}
                className="bg-zinc-800/50 border-white/5 h-10 rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Punjabi Content */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Punjabi Content
          </h3>
          <div className="space-y-2">
            <Label>ਪ੍ਰਸ਼ਨ (PA)</Label>
            <Textarea
              value={formData.question_pa}
              onChange={(e) => setFormData({...formData, question_pa: e.target.value})}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-24"
            />
          </div>
          {formData.options_pa.map((opt, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-[10px]">ਵਿਕਲਪ {String.fromCharCode(65+i)}</Label>
              <Input
                value={opt}
                onChange={(e) => handleOptionChange(i, 'pa', e.target.value)}
                className="bg-zinc-800/50 border-white/5 h-10 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
        <div className="space-y-2">
          <Label>Correct Answer Index</Label>
          <Select value={formData.correctAnswer.toString()} onValueChange={(val) => setFormData({...formData, correctAnswer: Number(val)})}>
            <SelectTrigger className="bg-zinc-800/50 border-white/5">
              <SelectValue placeholder="Select Index" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Option A</SelectItem>
              <SelectItem value="1">Option B</SelectItem>
              <SelectItem value="2">Option C</SelectItem>
              <SelectItem value="3">Option D</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Exam</Label>
          <Input value={formData.exam} onChange={(e) => setFormData({...formData, exam: e.target.value})} className="bg-zinc-800/50 border-white/5" />
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} className="bg-zinc-800/50 border-white/5" />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="bg-zinc-800/50 border-white/5" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Detailed Explanation (Markdown)</Label>
        <Textarea 
          value={formData.explanation} 
          onChange={(e) => setFormData({...formData, explanation: e.target.value})}
          className="bg-zinc-800/50 border-white/5 h-32 rounded-2xl" 
          placeholder="Why is this answer correct? Provide tricks or context..."
        />
      </div>

      <Button onClick={savePYQ} disabled={loading} className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-xl shadow-orange-900/10">
        {loading ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
        Finalize PYQ Injection
      </Button>
    </div>
  );
}
