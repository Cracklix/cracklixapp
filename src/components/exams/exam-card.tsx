
'use client';

import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExamCard({ exam }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-card/40 backdrop-blur-md p-8 rounded-[40px] text-white border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div>
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-[24px] bg-zinc-900 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
            {exam.icon || '🏛️'}
          </div>
          {exam.premium && (
            <Badge className="bg-yellow-500 text-black border-none font-black text-[10px] px-3 py-1">
              PRO
            </Badge>
          )}
        </div>

        <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
          {exam.name}
        </h2>
        <p className="text-zinc-500 text-xs mt-2 font-black uppercase tracking-widest">
          {exam.department}
        </p>
      </div>

      <div className="mt-10 space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-tighter">Mocks</p>
                  <h3 className="text-sm font-bold">{exam.totalMocks || 0}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-tighter">Aspirants</p>
                  <h3 className="text-sm font-bold">{(exam.activeStudents || 0).toLocaleString()}</h3>
                </div>
              </div>
           </div>
           
           <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
             <ChevronRight className="w-5 h-5 text-white" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
