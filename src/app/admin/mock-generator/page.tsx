
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Type, 
  Database,
  Rocket,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Brain,
  Layers,
  Settings2,
  Search,
  Languages,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXAM_LIST, SUBJECT_LIST } from '@/types';
import { parseRawText } from '@/services/question-parser';
import { extractText } from '@/services/ocr';
import { db } from '@/lib/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

export default function ManualBuilderPage() {
  const [activeTab, setActiveTab] = useState('raw');
  const [rawText, setRawText] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [config, setConfig] = useState({
    exam: '',
    subject: '',
    languageMode: 'en_pa',
    duration: 60,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    title: ''
  });

  const handleRawIngest = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const parsed = parseRawText(rawText);
      setQuestions([...questions, ...parsed]);
      setRawText('');
      toast({ title: "Ingested Successfully", description: `Added ${parsed.length} questions.` });
    } catch (e) {
      toast({ title: "Ingest Failed", description: "Format error.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOcr = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await extractText(file);
      const parsed = parseRawText(text);
      setQuestions([...questions, ...parsed]);
      toast({ title: "OCR Complete", description: `Extracted ${parsed.length} questions.` });
    } catch (e) {
      toast({ title: "OCR Error", description: "Could not read image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0 || !config.exam || !config.title) {
      toast({ title: "Missing Info", description: "Title and Exam required.", variant: "destructive" });
      return;
    }

    try {
      const batch = writeBatch(db);
      const mockRef = doc(collection(db, "mocks"));
      
      batch.set(mockRef, {
        id: mockRef.id,
        ...config,
        totalQuestions: questions.length,
        status: 'published',
        createdAt: Date.now(),
        attemptCount: 0
      });

      questions.forEach(q => {
        const qRef = doc(collection(db, "questions"));
        batch.set(qRef, {
          ...q,
          id: qRef.id,
          mockId: mockRef.id,
          exam: config.exam,
          subject: config.subject,
          createdAt: Date.now()
        });
      });

      await batch.commit();
      setQuestions([]);
      toast({ title: "Mock Live!", description: "Test published to arena." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save mock.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manual AI Mock Builder</h1>
            <p className="text-muted-foreground">Upload, Parse, and Build high-fidelity mock tests.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">
              <Database className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20" onClick={handlePublish}>
              <Rocket className="w-4 h-4 mr-2" />
              Publish Arena
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Column */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-none shadow-sm neo-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Test Config
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Mock Title</label>
                  <Input 
                    placeholder="e.g. PSSSB Clerk Official Mock" 
                    value={config.title}
                    onChange={e => setConfig({...config, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Target Exam</label>
                  <Select onValueChange={e => setConfig({...config, exam: e})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                  <Select onValueChange={e => setConfig({...config, subject: e})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Duration (Min)</label>
                    <Input type="number" value={config.duration} onChange={e => setConfig({...config, duration: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Negative Marks</label>
                    <Input type="number" step="0.25" value={config.negativeMarking} onChange={e => setConfig({...config, negativeMarking: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm neo-shadow bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <span className="font-bold">Test Statistics</span>
                  </div>
                  <Badge variant="secondary">{questions.length} Items</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Marks</span>
                    <span className="font-bold text-foreground">{questions.length * config.marksPerQuestion}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Est. Time Spent</span>
                    <span className="font-bold text-foreground">{config.duration} Min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingestion Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="raw" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-muted/50">
                <TabsTrigger value="raw" className="rounded-xl"><Type className="w-4 h-4 mr-2" /> Raw Text</TabsTrigger>
                <TabsTrigger value="pdf" className="rounded-xl"><FileText className="w-4 h-4 mr-2" /> PDF/Image</TabsTrigger>
                <TabsTrigger value="bank" className="rounded-xl"><Database className="w-4 h-4 mr-2" /> Atomic Bank</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="raw">
                  <Card className="rounded-3xl border-none neo-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <Textarea 
                        placeholder="Paste your questions here... 
Q1. Question Text
A. Option 1
B. Option 2
Answer: B"
                        className="min-h-[300px] border-none focus-visible:ring-0 text-base p-6 resize-none"
                        value={rawText}
                        onChange={e => setRawText(e.target.value)}
                      />
                      <div className="p-4 bg-muted/30 border-t flex justify-between items-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Multi-Stage Regex Active
                        </span>
                        <Button onClick={handleRawIngest} disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Process Text"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pdf">
                  <Card className="rounded-3xl border-none neo-shadow border-2 border-dashed flex flex-col items-center justify-center p-12 text-center bg-muted/10">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Drop PDF or Images</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">Local OCR extracts questions without AI costs. Supports English & Punjabi.</p>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={e => e.target.files && handleOcr(e.target.files[0])}
                    />
                    <Button onClick={() => document.getElementById('file-upload')?.click()}>Select Artifacts</Button>
                  </Card>
                </TabsContent>

                <TabsContent value="bank">
                  <Card className="rounded-3xl border-none neo-shadow p-12 text-center">
                    <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-bold text-lg">Smart Atomic Bank</h3>
                    <p className="text-muted-foreground text-sm">Access 50,000+ verified PSSSB/PPSC questions.</p>
                    <Button variant="outline" className="mt-6">Explore Bank</Button>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            {/* Questions Preview */}
            <AnimatePresence>
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Artifact Review</h3>
                    <Button variant="ghost" size="sm" onClick={() => setQuestions([])} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear All
                    </Button>
                  </div>
                  
                  {questions.map((q, i) => (
                    <Card key={i} className="rounded-2xl border-none neo-shadow overflow-hidden group">
                      <div className="p-4 bg-primary/5 flex justify-between items-center border-b">
                        <Badge variant="outline">Q {i + 1}</Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-bold text-lg">{q.question}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt: string, idx: number) => (
                              <div key={idx} className={cn(
                                "p-3 rounded-xl border text-sm",
                                String.fromCharCode(65 + idx) === q.answer ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-muted/30"
                              )}>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        {q.explanation && (
                          <div className="p-4 bg-muted/50 rounded-xl text-sm italic border-l-4 border-primary">
                            <span className="font-bold block mb-1">Rationalization:</span>
                            {q.explanation}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
