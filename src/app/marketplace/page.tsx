
'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Navbar from '@/components/navbar';
import { getProducts, Product, createProductOrder } from '@/services/marketplace';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Star, 
  Download, 
  FileText, 
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ["All", "Punjab GK", "Reasoning", "Math", "PCS", "Current Affairs"];

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts(activeCategory);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast({ title: "Auth Required", description: "Please log in to purchase resources.", variant: "destructive" });
      return;
    }

    setBuyingId(product.id);
    try {
      await createProductOrder(user.uid, product);
      toast({
        title: "Purchase Successful!",
        description: `"${product.title}" has been added to your downloads.`,
      });
      loadProducts();
    } catch (error: any) {
      toast({ title: "Purchase Failed", description: error.message, variant: "destructive" });
    } finally {
      setBuyingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.creatorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
            >
              <ShoppingBag className="w-4 h-4" />
              Creator Store
            </motion.div>
            <h1 className="font-headline text-5xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              High-yield notes, PDF short-tricks, and revision guides curated by Punjab's top educators.
            </p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
               <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
               <Input 
                 placeholder="Search notes, creators..." 
                 className="pl-10 h-12 bg-zinc-900 border-white/5 rounded-2xl"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-zinc-900 p-0">
               <Filter className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl h-11 px-6 font-bold transition-all ${
                activeCategory === cat 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-zinc-900/50 text-muted-foreground border-white/5 hover:bg-zinc-900"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-96 rounded-[32px] bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="rounded-[40px] cracklix-glass border-white/5 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={p.thumbnail || `https://picsum.photos/seed/${p.id}/800/600`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={p.title}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/60 backdrop-blur-md border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                          {p.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-primary px-3 py-1.5 rounded-xl text-white font-black text-lg shadow-xl">
                          ₹{p.price}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          by <span className="text-white font-bold">{p.creatorName}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-zinc-500 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {p.rating} ({p.reviewsCount})
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3 text-primary" />
                          {p.downloads} Sales
                        </div>
                      </div>

                      <Button 
                        onClick={() => handlePurchase(p)}
                        disabled={buyingId === p.id}
                        className="w-full h-12 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-primary hover:text-white transition-all font-bold group"
                      >
                        {buyingId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Get Access
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center space-y-6 rounded-[48px] border-2 border-dashed border-white/5 bg-zinc-900/20">
             <div className="w-20 h-20 rounded-[28px] bg-zinc-900 flex items-center justify-center mx-auto">
               <FileText className="w-10 h-10 text-muted-foreground opacity-20" />
             </div>
             <div>
               <h3 className="text-2xl font-bold">No resources found</h3>
               <p className="text-muted-foreground mt-2">Try adjusting your search or category filters.</p>
             </div>
          </div>
        )}

        {/* Creator CTA */}
        <div className="bg-gradient-to-br from-primary/10 via-zinc-900/50 to-accent/10 border border-primary/20 rounded-[48px] p-12 flex flex-col md:flex-row items-center justify-between gap-12 mt-20">
           <div className="space-y-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-primary/20">
                <Sparkles className="text-white w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold tracking-tight">Become a Creator</h2>
                <p className="text-xl text-muted-foreground max-w-md">
                  Have high-quality handwritten notes? Join our creator economy and earn while helping thousands of aspirants.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <Badge className="bg-zinc-800 text-white border-white/5 px-4 py-1.5 rounded-full font-bold">80% Revenue Share</Badge>
                 <Badge className="bg-zinc-800 text-white border-white/5 px-4 py-1.5 rounded-full font-bold">Instant Withdrawals</Badge>
              </div>
           </div>

           <Card className="rounded-[40px] p-8 cracklix-glass border-white/5 w-full md:w-96 text-center">
              <div className="flex justify-between items-center mb-8">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Creator Hub</span>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2 mb-8">
                 <p className="text-zinc-500 text-xs font-bold uppercase">Estimated Monthly</p>
                 <h3 className="text-5xl font-black">₹12,450+</h3>
              </div>
              <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-lg">
                Join as Creator
              </Button>
           </Card>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
