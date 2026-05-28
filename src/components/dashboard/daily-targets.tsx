
"use client";

import { useEffect, useState } from 'react';
import { getDailyTarget, saveDailyTarget } from '@/services/daily-target';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyTargets() {
  const { user } = useAuth();
  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getDailyTarget(user.uid).then(data => {
        if (!data) {
          const initial = {
            questionsGoal: 50,
            questionsCompleted: 0,
            mockGoal: 1,
            mockCompleted: 0,
            studyMinutesGoal: 120,
            studyMinutesCompleted: 0
          };
          saveDailyTarget(user.uid, initial);
          setTarget(initial);
        } else {
          setTarget(data);
        }
      });
    }
  }, [user]);

  if (!target) return null;

  const items = [
    { label: 'Practice MCQs', current: target.questionsCompleted || 0, goal: target.questionsGoal, color: 'bg-primary' },
    { label: 'Full Mocks', current: target.mockCompleted || 0, goal: target.mockGoal, color: 'bg-accent' },
    { label: 'Study Minutes', current: target.studyMinutesCompleted || 0, goal: target.studyMinutesGoal, color: 'bg-emerald-500' },
  ];

  return (
    <Card className="rounded-[40px] cracklix-glass border-white/5 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            Daily Engine
          </CardTitle>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Online</span>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        {items.map((item, i) => {
          const progress = Math.min((item.current / item.goal) * 100, 100);
          return (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-zinc-300">{item.label}</span>
                <span className="text-xs font-mono text-zinc-500">
                  <span className="text-white font-bold">{item.current}</span> / {item.goal}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold">Optimize for PCS Path</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
