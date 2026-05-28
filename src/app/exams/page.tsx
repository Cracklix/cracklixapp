
'use client';

import { useEffect, useState } from 'react';
import { getAllExams } from '@/services/exams';
import ExamCard from '@/components/exams/exam-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await getAllExams();
        setExams(data);
      } catch (error) {
        console.error("Failed to load exams", error);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline text-4xl font-bold">Punjab Govt Exams</h1>
            <p className="text-muted-foreground mt-2">Targeted training for PPSC, PSSSB, and State departments.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-[32px] bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))
            ) : (
              <div className="col-span-full p-12 text-center rounded-[32px] border border-dashed border-white/10">
                <p className="text-muted-foreground">No active exams found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
