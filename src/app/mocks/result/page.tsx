
'use client';

import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResultPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-headline text-4xl font-bold">Analysis Report</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-[32px] bg-primary/10 border-primary/20 p-6 text-center">
            <Trophy className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Final Score</p>
            <h2 className="text-4xl font-black mt-1">42.5</h2>
          </Card>

          <Card className="rounded-[32px] bg-accent/10 border-accent/20 p-6 text-center">
            <Target className="w-10 h-10 text-accent mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-accent/70">Accuracy</p>
            <h2 className="text-4xl font-black mt-1">85%</h2>
          </Card>

          <Card className="rounded-[32px] bg-secondary p-6 text-center border-white/5">
            <BarChart3 className="w-10 h-10 text-white/50 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attempted</p>
            <h2 className="text-4xl font-black mt-1">48/50</h2>
          </Card>
        </div>

        <Card className="rounded-[40px] border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden mb-8">
          <CardHeader className="p-8">
            <CardTitle>Topic-wise Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            {[
              { label: "Punjab GK", value: 90, color: "bg-primary" },
              { label: "Current Affairs", value: 65, color: "bg-accent" },
              { label: "Quantitative Aptitude", value: 40, color: "bg-destructive" },
            ].map((topic) => (
              <div key={topic.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{topic.label}</span>
                  <span className="text-muted-foreground">{topic.value}%</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${topic.color}`} style={{ width: `${topic.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="rounded-2xl h-14 flex-1 font-bold">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 flex-1 border-white/10 font-bold">
            <Link href="/exams">Try Another Mock</Link>
          </Button>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
