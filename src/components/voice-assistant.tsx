"use client";

import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceAssistant() {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="rounded-[40px] border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <p className="text-destructive font-bold">Browser does not support speech recognition.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[40px] cracklix-glass overflow-hidden border-white/5 bg-card/40">
      <CardHeader className="p-8">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Volume2 className="text-green-500 w-5 h-5" />
          </div>
          Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <div className="flex gap-4">
          <Button
            onClick={() => SpeechRecognition.startListening({ continuous: true })}
            disabled={listening}
            className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
          >
            {listening ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="flex items-center">
                <Mic className="mr-2" /> Listening...
              </motion.div>
            ) : (
              <><Mic className="mr-2" /> Start Voice</>
            )}
          </Button>

          <Button
            onClick={() => SpeechRecognition.stopListening()}
            variant="outline"
            className="h-14 w-14 rounded-2xl border-white/10"
          >
            <MicOff className="w-6 h-6" />
          </Button>

          <Button
            onClick={resetTranscript}
            variant="outline"
            className="h-14 w-14 rounded-2xl border-white/10"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>

        <div className="min-h-[150px] bg-black/20 p-6 rounded-[28px] border border-white/5 relative">
          <p className="text-white leading-relaxed text-lg">
            {transcript || "Speak something... 'Tell me about Maharaja Ranjit Singh'"}
          </p>
          <AnimatePresence>
            {listening && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4 flex gap-1"
              >
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-green-500 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}