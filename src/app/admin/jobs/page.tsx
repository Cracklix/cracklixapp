
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import { 
  addJobAlert, 
  getActiveJobs, 
  JobAlert, 
  updateJobAlert, 
  deleteJobAlert 
} from "@/services/job-alerts";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    department: "PSSSB",
    postCount: 0,
    lastDate: "",
    applyUrl: "",
    category: "Clerk",
    type: "vacancy" as const,
    status: "active" as const
  });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await getActiveJobs();
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addJobAlert({
        ...formData,
        lastDate: new Date(formData.lastDate).getTime()
      });
      toast({ title: "Alert Published", description: "The vacancy update is now live for students." });
      setFormData({ title: "", department: "PSSSB", postCount: 0, lastDate: "", applyUrl: "", category: "Clerk", type: "vacancy", status: "active" });
      loadJobs();
    } catch (e: any) {
      toast({ title: "Failed to publish", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await deleteJobAlert(id);
    loadJobs();
    toast({ title: "Alert Removed" });
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold text-white">Vacancy Command Center</h1>
                <p className="text-zinc-500">Dispatch recruitment updates and official notices to the student base.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-1">
                <Card className="rounded-[32px] bg-zinc-900/50 border-white/5 p-8 sticky top-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="text-primary w-5 h-5" />
                    New Job Alert
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Post Title</Label>
                      <Input 
                        placeholder="e.g. Excise Inspector 2024" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="bg-zinc-800/50 border-white/5 rounded-xl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Department</Label>
                        <Input 
                          placeholder="PPSC" 
                          value={formData.department}
                          onChange={e => setFormData({...formData, department: e.target.value})}
                          className="bg-zinc-800/50 border-white/5 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Type</Label>
                        <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                          <SelectTrigger className="bg-zinc-800/50 border-white/5 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vacancy">Vacancy</SelectItem>
                            <SelectItem value="result">Result</SelectItem>
                            <SelectItem value="admit_card">Admit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Last Date</Label>
                      <Input 
                        type="date" 
                        value={formData.lastDate}
                        onChange={e => setFormData({...formData, lastDate: e.target.value})}
                        className="bg-zinc-800/50 border-white/5 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Apply/Source URL</Label>
                      <Input 
                        placeholder="https://sssb.punjab.gov.in" 
                        value={formData.applyUrl}
                        onChange={e => setFormData({...formData, applyUrl: e.target.value})}
                        className="bg-zinc-800/50 border-white/5 rounded-xl"
                      />
                    </div>
                    <Button disabled={submitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold mt-4">
                      {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Broadcast Alert"}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Live Feed ({jobs.length})</h3>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white" onClick={loadJobs}>Refresh</Button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-3xl border border-white/5" />)}
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map(job => (
                    <Card key={job.id} className="rounded-3xl bg-zinc-900/40 border-white/5 hover:bg-zinc-900 transition-colors group overflow-hidden">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                              <Briefcase className="text-zinc-500 w-6 h-6 group-hover:text-primary transition-colors" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white text-lg">{job.title}</h4>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] uppercase">{job.type}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                 <span>{job.department}</span>
                                 <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Last: {new Date(job.lastDate).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button variant="ghost" size="icon" className="rounded-xl text-zinc-600 hover:text-white" asChild>
                              <a href={job.applyUrl} target="_blank"><ExternalLink className="w-4 h-4" /></a>
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="rounded-xl text-zinc-600 hover:text-destructive"
                             onClick={() => handleDelete(job.id)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-white/5">
                    <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 italic">No active job alerts in the stream.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
