'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Image as ImageIcon, 
  Database, 
  Plus, 
  Trash2, 
  Save, 
  Globe, 
  Settings,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EXAM_CONFIG, EXAM_LIST, SUBJECT_LIST } from '@/types';
import { parseRawText } from '@/services/question-parser';
import { extractText } from '@/services/ocr';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function ManualMockBuilder() {
  const [activeTab, setActiveTab] = useState('raw');
  const [selectedExam, setSelectedExam] = useState('PSSSB');
  const [selectedSubject, setSelectedSubject] = useState('Punjab GK');
  const [languageMode, setLanguageMode] = useState('English + Punjabi');
  const [rawText, setRawText] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // STABILITY: Convergent dependency array for subject sync
  useEffect(() => {
    if (selectedExam !== 'CUSTOM') {
      const examSubjects = EXAM_CONFIG[selectedExam as keyof typeof EXAM_CONFIG] || [];
      // Only update if current subject is not in the new exam's list
      if (!examSubjects.includes(selectedSubject)) {
        setSelectedSubject(examSubjects[0] || 'Other...');
      }
    }
  }, [selectedExam]); // Reduced dependencies to prevent thrashing

  const handleIngest = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const parsed = parseRawText(rawText);
      setQuestions(prev => [...prev, ...parsed]);
      setRawText('');
      toast({ title: "Ingestion Success", description: `Added ${parsed.length} questions.` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await extractText(file);
      setRawText(text);
      toast({ title: "OCR Complete", description: "Review and click Process to ingest." });
    } catch (err) {
      toast({ title: "OCR Error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const publishMock = async () => {
    if (questions.length === 0) return;
    try {
      const mockData = {
        title: `${selectedExam} ${selectedSubject} Manual Mock`,
        exam: selectedExam,
        subject: selectedSubject,
        languageMode,
        totalQuestions: questions.length,
        status: 'published',
        questions,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'mocks'), mockData);
      toast({ title: "Mock Published", description: "Successfully synced to arena." });
      setQuestions([]);
    } catch (e) {
      toast({ title: "Publish Error", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-[#050505] min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold tracking-tight">MANUAL MOCK BUILDER</h1>
              <p className="text-sm text-zinc-500">Upload, Parse, and Publish high-fidelity Punjab exams.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-zinc-800 bg-zinc-900" onClick={() => setQuestions([])}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500" onClick={publishMock} disabled={questions.length === 0}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Publish Mock
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5 bg-[#0a0a0a] border-zinc-800 space-y-5">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Target Exam
                </label>
                <select 
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {EXAM_LIST.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-3 h-3" /> Core Subject
                </label>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {(EXAM_CONFIG[selectedExam as keyof typeof EXAM_CONFIG] || SUBJECT_LIST).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Language Mode
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {['English', 'Punjabi', 'English + Punjabi', 'Trilingual'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setLanguageMode(mode)}
                      className={cn(
                        "text-left p-2.5 rounded-lg text-xs border transition-all",
                        languageMode === mode 
                          ? "bg-blue-600/10 border-blue-500/50 text-blue-400" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Ingest Area */}
          <div className="lg:col-span-9 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-[#0a0a0a] border border-zinc-800 w-full justify-start p-1 h-12 rounded-xl">
                <TabsTrigger value="raw" className="flex-1 data-[state=active]:bg-zinc-800">
                  <FileText className="w-4 h-4 mr-2" /> Raw Ingest
                </TabsTrigger>
                <TabsTrigger value="ocr" className="flex-1 data-[state=active]:bg-zinc-800">
                  <ImageIcon className="w-4 h-4 mr-2" /> OCR / PDF
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 data-[state=active]:bg-zinc-800">
                  <Settings className="w-4 h-4 mr-2" /> Preview Bank ({questions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="raw" className="mt-6 space-y-4">
                <Card className="p-6 bg-[#0a0a0a] border-zinc-800">
                  <Textarea 
                    placeholder="Q1. Example Question?&#10;A. Option 1&#10;B. Option 2&#10;Answer: A"
                    className="min-h-[300px] bg-zinc-900 border-zinc-800 font-mono text-sm"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      Parser supports multi-line questions and automatic answer detection.
                    </p>
                    <Button onClick={handleIngest} disabled={!rawText.trim() || isProcessing} className="bg-blue-600 hover:bg-blue-500">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Process Ingest
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="ocr" className="mt-6">
                <Card className="p-12 bg-[#0a0a0a] border-zinc-800 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Neural OCR Engine</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">Upload PDF or Image. Our hybrid local OCR extracts text without hitting cloud limits.</p>
                  </div>
                  <input 
                    type="file" 
                    id="ocr-upload" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="application/pdf,image/*"
                  />
                  <Button asChild variant="outline" className="border-zinc-800 hover:bg-zinc-900">
                    <label htmlFor="ocr-upload" className="cursor-pointer">
                      <FileSearch className="w-4 h-4 mr-2" /> Select File
                    </label>
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <div className="grid grid-cols-1 gap-4">
                  {questions.length === 0 ? (
                    <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-zinc-800 text-zinc-500">
                      No questions in bank yet. Start by ingesting some!
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <Card key={idx} className="p-4 bg-[#0a0a0a] border-zinc-800">
                        <div className="flex justify-between">
                          <Badge className="bg-zinc-800 text-zinc-400 mb-2">Q{idx + 1}</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => {
                            const newQ = [...questions];
                            newQ.splice(idx, 1);
                            setQuestions(newQ);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold mb-3">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className={cn(
                              "p-2 rounded border",
                              String.fromCharCode(65 + oIdx) === q.answer ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-zinc-800 bg-zinc-900/50"
                            )}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
