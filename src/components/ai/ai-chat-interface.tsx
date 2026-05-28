"use client";

import { useState, useRef, useEffect } from 'react';
import { askAiTutor } from '@/ai/flows/ai-tutor-flow';
import { solveOcrQuestion } from '@/ai/flows/ocr-solver-flow';
import { generateVoiceExplanation } from '@/ai/flows/voice-tutor-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  Loader2, 
  Bot, 
  User, 
  RotateCcw, 
  Camera, 
  Volume2, 
  VolumeX, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'ai';
  content: string;
  id: string;
  suggestedTopics?: string[];
  image?: string;
  audio?: string;
};

export default function AiChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      let reply = "";
      let suggestedTopics: string[] = [];

      if (currentImage) {
        const result = await solveOcrQuestion({ 
          photoDataUri: currentImage,
          userPrompt: input 
        });
        reply = `**Subject:** ${result.subject}\n\n**Extracted Question:** ${result.extractedText}\n\n**Solution:**\n${result.solution}\n\n**Key Concepts:** ${result.keyConcepts.join(', ')}`;
        suggestedTopics = result.keyConcepts;
      } else {
        const result = await askAiTutor({ message: input });
        reply = result.reply;
        suggestedTopics = result.suggestedTopics || [];
      }

      const aiMessage: Message = {
        role: 'ai',
        content: reply,
        id: (Date.now() + 1).toString(),
        suggestedTopics,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Tutor Error:", error);
      toast({
        title: "AI error",
        description: "Sorry, I encountered an issue. Please check your image size or network.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoicePlay = async (message: Message) => {
    if (playingAudio === message.id) {
      setPlayingAudio(null);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    if (message.audio) {
      setPlayingAudio(message.id);
      return;
    }

    try {
      const { audioDataUri } = await generateVoiceExplanation({ text: message.content.replace(/[#*]/g, '') });
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, audio: audioDataUri } : m
      );
      setMessages(updatedMessages);
      setPlayingAudio(message.id);
    } catch (err) {
      console.error("TTS Error:", err);
      toast({ title: "Audio Error", description: "Could not generate voice for this message.", variant: "destructive" });
    }
  };

  return (
    <Card className="rounded-[40px] cracklix-glass h-[750px] flex flex-col overflow-hidden border-primary/20 bg-primary/5">
      <CardHeader className="p-8 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">CRACKLIX AI Studio</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary/70">
                OCR • Voice • 2.5 Flash
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl border border-white/5" onClick={() => setMessages([])}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50"
            >
              <div className="w-16 h-16 rounded-[24px] bg-secondary flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Next-Gen Doubt Solving</h3>
                <p className="text-sm max-w-xs">Upload a photo of a question or ask any doubt in text. I can even speak the answers back to you.</p>
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-accent' : 'bg-primary'}`}>
                {m.role === 'user' ? <User className="text-accent-foreground w-5 h-5" /> : <Bot className="text-white w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-5 rounded-[28px] ${m.role === 'user' ? 'bg-accent/10 border border-accent/20 rounded-tr-none' : 'bg-secondary/50 border border-white/5 rounded-tl-none shadow-xl'}`}>
                {m.image && (
                  <img src={m.image} className="w-full max-w-xs rounded-xl mb-4 border border-white/10" alt="Uploaded Question" />
                )}
                
                <div className="prose prose-invert prose-sm text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>

                {m.role === 'ai' && (
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {m.suggestedTopics?.map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] uppercase border-primary/20 text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setInput(t)}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full h-8 w-8 ${playingAudio === m.id ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => handleVoicePlay(m)}
                    >
                      {playingAudio === m.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Loader2 className="text-white w-5 h-5 animate-spin" />
              </div>
              <div className="bg-secondary/50 border border-white/5 p-5 rounded-[28px] rounded-tl-none italic text-muted-foreground text-sm">
                AI is processing your request...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <div className="p-8 border-t border-white/5 bg-black/20">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 relative"
            >
              <img src={selectedImage} className="h-24 w-auto rounded-xl border border-primary/40 shadow-lg" alt="Preview" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -left-2 bg-destructive text-white rounded-full p-1 shadow-lg"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="absolute left-3 bottom-3 flex gap-2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a doubt or upload a photo of a question..."
            className="min-h-[60px] max-h-[200px] rounded-3xl bg-zinc-900 border-white/10 pl-14 pr-16 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="absolute right-3 bottom-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
            onClick={handleSend}
            disabled={loading || (!input.trim() && !selectedImage)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Hidden Global Audio Player */}
      {playingAudio && (
        <audio 
          autoPlay 
          src={messages.find(m => m.id === playingAudio)?.audio} 
          onEnded={() => setPlayingAudio(null)}
          ref={audioRef}
        />
      )}
    </Card>
  );
}