
'use client';

import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Lock } from 'lucide-react';

export default function MocksPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24">
        <h1 className="font-headline text-4xl font-bold mb-2">Mock Tests</h1>
        <p className="text-muted-foreground mb-8">Simulation environments for Punjab Civil Services and departmental exams.</p>

        <div className="grid grid-cols-1 gap-6">
          <Card className="rounded-[32px] bg-card/60 backdrop-blur-md border-white/5 border-dashed border-2 overflow-hidden">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Simulated Mocks Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                We are currently indexing the latest exam patterns from the PPSC and PSSSB boards.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                <Lock className="w-3 h-3" />
                Beta testing in progress
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
