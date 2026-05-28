"use client";

import { useState } from "react";
import { generatePDF } from "@/services/pdf-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Sparkles } from "lucide-react";

export default function NotesPDF() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <Card className="rounded-[40px] cracklix-glass overflow-hidden border-white/5 bg-card/40">
      <CardHeader className="p-8">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="text-purple-500 w-5 h-5" />
          </div>
          AI PDF Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-4">
        <Input
          placeholder="Topic Title (e.g., Rivers of Punjab)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 bg-zinc-800/50 rounded-xl border-white/5"
        />

        <Textarea
          placeholder="Paste or type your study notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[160px] bg-zinc-800/50 rounded-2xl border-white/5 leading-relaxed"
        />

        <Button
          onClick={() => generatePDF(title || "Untitled_Notes", content)}
          disabled={!content}
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold"
        >
          <FileDown className="mr-2" />
          Export to High-Quality PDF
        </Button>
      </CardContent>
    </Card>
  );
}