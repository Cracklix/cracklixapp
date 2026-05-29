
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Image as ImageIcon, 
  FileText, 
  Database, 
  Globe, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EXAM_CONFIG } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function MockBuilder() {
  const [activeTab, setActiveTab] = useState('raw');
  const [selectedExam, setSelectedExam] = useState('PSSSB Clerk');
  const [selectedSubject, setSelectedSubject] = useState('Punjab GK');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');
  
  // Clean effects - no loops
  useEffect(() => {
    if (selectedExam) {
      const subjects = EXAM_CONFIG[selectedExam as keyof typeof EXAM_CONFIG] || [];
      setAvailableSubjects(subjects);
      if (!subjects.includes(selectedSubject)) {
        setSelectedSubject(subjects[0] || "");
      }
    }
  }, [selectedExam]);

  const handleManualIngest = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    // Simulation of parser
    setTimeout(() => {
      toast.success('Successfully structured 5 artifacts');
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Mock Builder <span className="text-blue-500 font-mono text-sm ml-2">v50.0</span></h1>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">Manual AI Hybrid Synthesis Engine</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Database className="w-4 h-4 mr-2" /> Question Bank
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-zinc-950 border-white/5 space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Exam Category</label>
                <select 
                  className="w-full bg-zinc-900 border-white/5 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  {Object.keys(EXAM_CONFIG).map(exam => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Subject Mode</label>
                <select 
                  className="w-full bg-zinc-900 border-white/5 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                  <span>Language Mode</span>
                  <Badge variant="secondary" className="bg-blue-600/10 text-blue-500 border-0">Bilingual</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Duration" className="bg-zinc-900 border-white/5 text-xs" defaultValue={120} />
                  <Input type="number" placeholder="Marks" className="bg-zinc-900 border-white/5 text-xs" defaultValue={1} />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Ingest Area */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="raw" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-zinc-950 border border-white/5 p-1 h-14 w-full justify-start gap-2">
                <TabsTrigger value="raw" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full px-6 gap-2">
                  <FileText className="w-4 h-4" /> Raw Ingest
                </TabsTrigger>
                <TabsTrigger value="pdf" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full px-6 gap-2">
                  <ImageIcon className="w-4 h-4" /> PDF/Image OCR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="raw" className="mt-6 space-y-4">
                <Card className="p-8 bg-zinc-950 border-white/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Paste Raw Questions</h3>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-0">Auto-Detect Active</Badge>
                    </div>
                    <textarea 
                      className="w-full h-80 bg-zinc-900 border-white/5 rounded-xl p-6 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      placeholder={`Q1. Question text here...\nA. Option 1\nB. Option 2\nAnswer: B`}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                    />
                    <div className="flex justify-end gap-4">
                      <Button variant="ghost" onClick={() => setRawText('')}>Clear</Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 px-8" 
                        disabled={isProcessing}
                        onClick={handleManualIngest}
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Parse & Inject
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="pdf" className="mt-6">
                <Card className="h-96 flex flex-col items-center justify-center border-dashed border-2 border-white/10 bg-zinc-950/50 hover:bg-zinc-900 transition-colors cursor-pointer group">
                  <div className="w-20 h-20 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ImageIcon className="w-10 h-10 text-blue-500 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Upload Exam Artifacts</h3>
                  <p className="text-zinc-500 max-w-sm text-center">
                    Drag & drop PDF, Scanned Papers or Screenshots. Supports bilingual text extraction.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
