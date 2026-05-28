"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

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
    marks: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function saveQuestion() {
    if (!formData.question || !formData.correctAnswer) {
      toast({ title: "Error", description: "Question and correct answer are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        question: formData.question,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctAnswer: formData.correctAnswer,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        marks: Number(formData.marks),
        createdAt: Date.now(),
      });

      toast({ title: "Success", description: "Question added to bank." });
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
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <PlusCircle className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Question</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-emerald-500">Correct Answer</Label>
            <Input
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              placeholder="Must match one option exactly"
              className="bg-zinc-800/50 border-emerald-500/30 rounded-xl h-12"
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

        <Button 
          onClick={saveQuestion} 
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold mt-6"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
          Save Question to Bank
        </Button>
      </div>
    </div>
  );
}
