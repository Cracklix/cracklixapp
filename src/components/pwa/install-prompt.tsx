"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 5 seconds of session
      setTimeout(() => setIsVisible(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[100]"
        >
          <div className="bg-zinc-950 border border-primary/20 rounded-[32px] p-6 shadow-2xl blue-glow overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Smartphone size={120} />
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Install CRACKLIX</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get the full app experience with offline mocks and instant rank alerts.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleInstall}
                className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90 font-black text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="rounded-2xl h-12 border border-white/5 text-xs font-bold"
              >
                Later
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}