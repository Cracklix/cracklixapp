
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, ChevronRight, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const exams = [
  {
    id: 'phys-101',
    title: 'Thermodynamics Fundamental',
    subject: 'Physics',
    difficulty: 'Advanced',
    duration: '45 mins',
    questions: 30,
    xp: 600,
    image: 'https://picsum.photos/seed/physics/600/400'
  },
  {
    id: 'chem-202',
    title: 'Organic Compounds & Reactions',
    subject: 'Chemistry',
    difficulty: 'Intermediate',
    duration: '60 mins',
    questions: 45,
    xp: 750,
    image: 'https://picsum.photos/seed/chem/600/400'
  },
  {
    id: 'bio-303',
    title: 'Molecular Genetics',
    subject: 'Biology',
    difficulty: 'Elite',
    duration: '90 mins',
    questions: 60,
    xp: 1200,
    image: 'https://picsum.photos/seed/bio/600/400'
  },
  {
    id: 'math-404',
    title: 'Multivariable Calculus',
    subject: 'Mathematics',
    difficulty: 'Intermediate',
    duration: '50 mins',
    questions: 25,
    xp: 500,
    image: 'https://picsum.photos/seed/math/600/400'
  }
];

export default function ExamsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="font-headline text-3xl font-bold">Available Exams</h1>
            <p className="text-muted-foreground">Choose your training ground and earn XP.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button variant="outline" className="rounded-2xl h-12 border-white/5 bg-card px-4">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="flex items-center bg-secondary/50 rounded-2xl px-4 h-12 border border-white/5 flex-1 md:w-64">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input type="text" placeholder="Search exams..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {exams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[32px] cracklix-glass border-white/5 overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-transform duration-300">
                <div className="relative h-40">
                  <img src={exam.image} alt={exam.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                      exam.difficulty === 'Elite' ? 'bg-destructive text-white' : 
                      exam.difficulty === 'Advanced' ? 'bg-orange-500 text-white' : 'bg-primary text-white'
                    )}>
                      {exam.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">{exam.subject}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {exam.duration}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 text-primary" />
                      {exam.questions} Questions
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1 text-accent" />
                      {exam.xp} XP
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={`/exams/${exam.id}`} className="w-full">
                    <Button className="w-full h-12 rounded-2xl bg-secondary hover:bg-primary hover:text-white transition-all group">
                      Initialize Session
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
