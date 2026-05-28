
'use client';

import { useEffect, useState } from 'react';
import { getAllExams } from '@/services/exams';
import ExamCard from '@/components/exams/exam-card';
import Navbar from '@/components/navbar';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter">Punjab Career Hub</h1>
            <p className="text-muted-foreground mt-2 text-lg">Choose your target recruitment board to enter the specialized arena.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-[40px] bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.slug}`}>
                  <ExamCard exam={exam} />
                </Link>
              ))
            ) : (
              <div className="col-span-full p-20 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-secondary/10">
                <p className="text-muted-foreground font-medium">The recruitment board index is updating. Check back in a few minutes.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
