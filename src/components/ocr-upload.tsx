"use client";

import { useState } from "react";
import { extractText } from "@/services/ocr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, FileText } from "lucide-react";

export default function OCRUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleOCR() {
    if (!file) return;
    setLoading(true);
    try {
      const extracted = await extractText(file);
      setText(extracted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[40px] cracklix-glass overflow-hidden border-white/5 bg-card/40">
      <CardHeader className="p-8">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Camera className="text-blue-500 w-5 h-5" />
          </div>
          OCR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <div className="p-8 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="ocr-upload"
          />
          <label htmlFor="ocr-upload" className="cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
              <Camera className="w-8 h-8 text-muted-foreground group-hover:text-white" />
            </div>
            <p className="text-sm font-medium">Click to capture question</p>
            {file && <p className="text-xs text-primary mt-2 font-bold uppercase tracking-widest">{file.name}</p>}
          </label>
        </div>

        <Button
          onClick={handleOCR}
          disabled={loading || !file}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
          {loading ? "Analyzing Image..." : "Extract Question Text"}
        </Button>

        {text && (
          <div className="bg-zinc-800/50 p-6 rounded-[28px] border border-white/5">
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
              {text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}