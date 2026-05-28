
'use client';

import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';

export default function ExamCard({ exam }: any) {
  return (
    <div className="bg-card/60 backdrop-blur-md p-6 rounded-[32px] text-white border border-white/5 hover:bg-card/80 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl mb-4">{exam.icon || '🏛️'}</div>
          <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {exam.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {exam.category}
          </p>
        </div>

        {exam.premium && (
          <Badge className="bg-yellow-500 text-black border-none font-bold">
            PRO
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/5 pt-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-tighter">Mocks</p>
            <h3 className="text-base font-bold">{exam.totalMocks || 0}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-tighter">Aspirants</p>
            <h3 className="text-base font-bold">{(exam.activeStudents || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
