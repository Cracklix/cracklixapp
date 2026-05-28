
"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, History, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function QuestionForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    subject: "Punjab GK",
    topic: "",
    difficulty: "medium",
    marks: 1,
    pyq: false,
    year: new Date().getFullYear(),
    exam: "Punjab Police",
    qualityScore: 80
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, pyq: checked });
  };

  async function saveQuestion() {
    if (!formData.question || !formData.correctAnswer) {
      toast({ title: "Error", description: "Question and correct answer are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        ...formData,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        createdAt: Date.now(),
      });

      toast({ title: "Success", description: "Question added to bank with AI scoring metadata." });
      setFormData({
        ...formData,
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: ""
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <PlusCircle className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Intelligent Question Bank</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-zinc-400">Question Content</Label>
          <Textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Enter the question here..."
            className="min-h-[120px] bg-zinc-800/50 border-white/5 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Label className="text-zinc-400">Option {i}</Label>
              <Input
                name={`option${i}`}
                value={(formData as any)[`option${i}`]}
                onChange={handleChange}
                placeholder={`Option ${i}`}
                className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <Label className="text-emerald-500">Correct Answer</Label>
            <Input
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              placeholder="Exact option match"
              className="bg-zinc-800/50 border-emerald-500/30 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Target Exam</Label>
            <Input
              name="exam"
              value={formData.exam}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Subject</Label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="flex items-center gap-3 bg-zinc-800/30 p-4 rounded-xl border border-white/5">
            <Checkbox id="pyq" checked={formData.pyq} onCheckedChange={handleCheckboxChange} />
            <label htmlFor="pyq" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
              <History className="w-4 h-4 text-primary" /> PYQ?
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">PYQ Year</Label>
            <Input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Quality Score (0-100)</Label>
            <div className="relative">
              <Input
                name="qualityScore"
                type="number"
                value={formData.qualityScore}
                onChange={handleChange}
                className="bg-zinc-800/50 border-white/5 rounded-xl h-12 pl-10"
              />
              <Star className="absolute left-3 top-3.5 w-4 h-4 text-yellow-500" />
            </div>
          </div>
          <Button 
            onClick={saveQuestion} 
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
            Save to Bank
          </Button>
        </div>
      </div>
    </div>
  );
}
