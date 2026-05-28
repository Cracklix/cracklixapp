"use client";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  addDoc,
  collection
} from "firebase/firestore";
import {
  storage,
  db
} from "@/lib/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function uploadPDF() {
    if (!file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `pdfs/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "pdfs"), {
        name: file.name,
        url,
        createdAt: Date.now(),
      });

      toast({ title: "Success", description: "PDF uploaded and indexed successfully." });
      setFile(null);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <FileText className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Resource PDF</h2>
      </div>

      <div className="space-y-6">
        <div className="p-8 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
          <Upload className="w-10 h-10 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
          <p className="text-sm text-muted-foreground mb-4">Click to browse or drag and drop PDF</p>
          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer bg-transparent border-none file:hidden"
          />
          {file && (
            <div className="mt-4 p-3 bg-primary/10 rounded-xl flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              {file.name}
            </div>
          )}
        </div>

        <Button
          onClick={uploadPDF}
          disabled={loading || !file}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
          {loading ? "Uploading to Cloud..." : "Initiate Upload"}
        </Button>
      </div>
    </div>
  );
}