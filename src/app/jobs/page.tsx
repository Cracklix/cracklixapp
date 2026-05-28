
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/navbar";
import { getActiveJobs, JobAlert } from "@/services/job-alerts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, Calendar, Users, ExternalLink, MapPin } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-24">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Briefcase className="text-emerald-500 w-5 h-5" />
             </div>
             <h1 className="font-headline text-4xl font-bold">Punjab Job Alerts</h1>
          </div>
          <p className="text-zinc-500 max-w-xl">Real-time vacancy updates from PPSC, PSSSB, and State Departments.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="rounded-[32px] cracklix-glass border-white/5 overflow-hidden hover:bg-white/[0.05] transition-all group">
                    <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase">
                            {job.category}
                          </Badge>
                          <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-white/5 text-[10px] font-black uppercase">
                            {job.postCount} Posts
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="text-zinc-500 flex items-center gap-2 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 px-8 border-l border-white/5 hidden md:flex">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Apply By</p>
                          <p className="font-bold text-white flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-primary" />
                             {new Date(job.lastDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold w-full md:w-auto shadow-xl shadow-white/5">
                        <a href={job.applyUrl} target="_blank">
                          Apply Now <ExternalLink className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-950/20">
                <Briefcase className="w-16 h-16 text-zinc-500 opacity-20 mx-auto mb-6" />
                <h3 className="text-xl font-bold">No active vacancies</h3>
                <p className="text-zinc-500 mt-2">The notification board is currently quiet. Check back in a few hours.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </AppLayout>
  );
}
