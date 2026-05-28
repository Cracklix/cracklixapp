"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Settings2 } from "lucide-react";

export default function MockBuilder() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    exam: "Punjab Police",
    duration: "60",
    totalQuestions: "50",
    negativeMarking: "0.25",
    premium: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function createMock() {
    if (!formData.title) {
      toast({ title: "Error", description: "Mock title is required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "mocks"), {
        title: formData.title,
        exam: formData.exam,
        duration: Number(formData.duration),
        totalQuestions: Number(formData.totalQuestions),
        negativeMarking: Number(formData.negativeMarking),
        premium: formData.premium,
        published: false,
        createdAt: Date.now(),
      });

      toast({ title: "Success", description: "Draft mock created successfully." });
      setFormData({ ...formData, title: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <FileText className="text-emerald-500 w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Mock Test</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-zinc-400">Test Title</Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Punjab Police Sub-Inspector Mock 1"
            className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-zinc-400">Exam Category</Label>
            <Input
              name="exam"
              value={formData.exam}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Duration (Minutes)</Label>
            <Input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label className="text-zinc-400">Total Questions</Label>
            <Input
              name="totalQuestions"
              type="number"
              value={formData.totalQuestions}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Negative Marking</Label>
            <Input
              name="negativeMarking"
              type="number"
              step="0.25"
              value={formData.negativeMarking}
              onChange={handleChange}
              className="bg-zinc-800/50 border-white/5 rounded-xl h-12"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-800/30 border border-white/5 flex items-center gap-4">
          <Settings2 className="text-zinc-500 w-5 h-5" />
          <p className="text-sm text-zinc-400 flex-1">
            Note: Created mocks are saved as <span className="text-white font-bold">Draft</span>. You must link questions and publish them manually to make them live.
          </p>
        </div>

        <Button 
          onClick={createMock} 
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold mt-6"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
          Initialize Mock Test
        </Button>
      </div>
    </div>
  );
}
