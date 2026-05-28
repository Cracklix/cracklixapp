
"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/sidebar';
import AdminProtect from '@/components/admin/admin-protect';
import { getPaymentSettings, savePaymentSettings, PaymentSettings } from '@/services/payment-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Save, 
  Lock,
  Globe,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<PaymentSettings>({
    provider: 'razorpay',
    keyId: '',
    secret: '',
    webhookSecret: '',
    mode: 'sandbox',
    enabled: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await getPaymentSettings();
      if (data) setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await savePaymentSettings(settings);
      toast({ title: "Configuration Updated", description: "Payment gateway secrets synchronized." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminProtect>
        <div className="flex bg-black min-h-screen">
          <AdminSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </main>
        </div>
      </AdminProtect>
    );
  }

  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[20px] bg-primary/20 flex items-center justify-center shadow-lg blue-glow">
                       <CreditCard className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter">Gateway Config</h1>
                  </div>
                  <p className="text-zinc-500 font-medium ml-1">Configure Razorpay credentials and monetization status.</p>
               </div>
               <Badge className={settings.mode === 'live' ? 'bg-emerald-500' : 'bg-orange-500'}>
                 {settings.mode.toUpperCase()} MODE
               </Badge>
            </header>

            <div className="grid gap-10">
               <Card className="rounded-[40px] bg-zinc-900/50 border-white/5 p-10 space-y-10 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                     <Lock size={200} />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                           <ShieldCheck className="text-primary" />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold">Razorpay Credentials</h3>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">Production Key Vault</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-black/40 p-1.5 px-4 rounded-full border border-white/5">
                        <span className="text-[10px] font-black uppercase text-zinc-500">Live Gateway</span>
                        <Switch 
                          checked={settings.enabled} 
                          onCheckedChange={(val) => setSettings({...settings, enabled: val})}
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Key ID</Label>
                        <Input 
                          placeholder="rzp_test_..." 
                          value={settings.keyId}
                          onChange={e => setSettings({...settings, keyId: e.target.value})}
                          className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-mono text-sm px-6"
                        />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Key Secret</Label>
                        <Input 
                          type="password"
                          placeholder="••••••••••••••••" 
                          value={settings.secret}
                          onChange={e => setSettings({...settings, secret: e.target.value})}
                          className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-mono text-sm px-6"
                        />
                     </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                     <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Webhook Secret (Sign Verification)</Label>
                     <Input 
                       placeholder="e.g. WH_SEC_42" 
                       value={settings.webhookSecret}
                       onChange={e => setSettings({...settings, webhookSecret: e.target.value})}
                       className="h-14 bg-zinc-800/40 border-white/5 rounded-2xl font-mono text-sm px-6"
                     />
                  </div>

                  <div className="pt-8 border-t border-white/5 grid md:grid-cols-2 gap-8 relative z-10">
                     <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/20 flex gap-4 items-start">
                        <Zap className="text-primary shrink-0" size={20} />
                        <div>
                           <p className="text-xs font-bold text-white mb-1">Environment Switching</p>
                           <p className="text-[10px] text-zinc-500 leading-relaxed">Toggle between Test and Production. Ensure correct keys are mapped before switching to Live.</p>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="mt-4 h-8 rounded-lg border-primary/20 text-[9px] font-black uppercase"
                             onClick={() => setSettings({...settings, mode: settings.mode === 'sandbox' ? 'live' : 'sandbox'})}
                           >
                             Switch to {settings.mode === 'sandbox' ? 'Production' : 'Sandbox'}
                           </Button>
                        </div>
                     </div>
                     
                     <div className="p-6 rounded-[28px] bg-zinc-800/40 border border-white/5 flex gap-4 items-start">
                        <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                        <div>
                           <p className="text-xs font-bold text-white mb-1">Security Notice</p>
                           <p className="text-[10px] text-zinc-500 leading-relaxed">Keys are stored in a privileged settings collection. Access is restricted to Master Admin identity only.</p>
                        </div>
                     </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full h-20 rounded-[28px] bg-primary hover:bg-primary/90 text-2xl font-black shadow-2xl blue-glow"
                  >
                    {saving ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
                    SYNC GATEWAY SETTINGS
                  </Button>
               </Card>

               <div className="p-8 rounded-[40px] bg-zinc-900 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                        <Globe size={24} className="text-zinc-500" />
                     </div>
                     <div>
                        <h4 className="font-bold">Next Expansion: Stripe</h4>
                        <p className="text-xs text-zinc-500">Universal architecture is ready for multi-gateway orchestration.</p>
                     </div>
                  </div>
                  <Button variant="ghost" disabled className="text-zinc-700 font-black text-xs uppercase tracking-widest">Connect Stripe (Soon)</Button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
