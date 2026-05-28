
'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { getCreatorEarnings, getCreatorProducts, Product } from '@/services/marketplace';
import { 
  IndianRupee, 
  TrendingUp, 
  Package, 
  Download, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getCreatorEarnings(user.uid),
        getCreatorProducts(user.uid)
      ]).then(([earningData, productsData]) => {
        setStats(earningData);
        setProducts(productsData);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return null;

  const cards = [
    { label: "Total Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Sales", value: stats?.salesCount || 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Live Products", value: products.length, icon: Package, color: "text-accent", bg: "bg-accent/10" },
    { label: "Pending Payout", value: `₹${stats?.pendingBalance || 0}`, icon: Wallet, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold">Creator Console</h1>
            <p className="text-muted-foreground mt-1">Manage your publications and track revenue performance.</p>
          </div>
          <Link href="/creator/upload">
            <Button size="lg" className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold group shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
              Publish New Resource
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[32px] cracklix-glass border-white/5 overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{card.label}</p>
                    <h2 className="text-3xl font-black tracking-tight">{card.value}</h2>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Products List */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Your Inventory</h3>
                <Link href="#" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {products.length > 0 ? (
                  products.map((p) => (
                    <div key={p.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[32px] flex items-center justify-between group hover:bg-zinc-900 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 shrink-0">
                          <img src={p.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{p.title}</h4>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                              <Download className="w-3 h-3" /> {p.downloads} Sales
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                              <Package className="w-3 h-3" /> {p.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right hidden sm:block">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price</p>
                           <p className="text-lg font-black">₹{p.price}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 group-hover:bg-primary group-hover:text-white transition-all">
                           <ExternalLink className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-zinc-900/20">
                    <Package className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">You haven't published any resources yet.</p>
                    <Link href="/creator/upload">
                      <Button variant="link" className="text-primary font-bold mt-2">Initialize your first product</Button>
                    </Link>
                  </div>
                )}
              </div>
           </div>

           {/* Sidebar: Activity/Tips */}
           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[40px] p-8 cracklix-glass border-white/5 bg-primary/5">
                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold">Withdraw Earnings</CardTitle>
                  <ArrowUpRight className="text-primary" />
                </CardHeader>
                <div className="space-y-6">
                  <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Available for Payout</p>
                    <h3 className="text-4xl font-black">₹{stats?.pendingBalance || 0}</h3>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold" disabled={!stats?.pendingBalance}>
                    Withdraw to UPI / Bank
                  </Button>
                  <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest">
                    Next payout processing: Mon, 10 AM
                  </p>
                </div>
              </Card>

              <Card className="rounded-[40px] p-8 cracklix-glass border-white/5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Growth Strategy
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Punjab Police Patwari candidates are searching for 'Computer Short Tricks' this week. High demand detected."
                </p>
              </Card>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
