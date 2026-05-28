
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ProductUploadPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Punjab GK");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!user || !title || !price || !pdfFile) {
      toast({ title: "Missing Fields", description: "Please fill all required fields and select a PDF.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload PDF
      const pdfRef = ref(storage, `marketplace/pdfs/${Date.now()}_${pdfFile.name}`);
      await uploadBytes(pdfRef, pdfFile);
      const pdfUrl = await getDownloadURL(pdfRef);

      // 2. Upload Thumbnail (optional but recommended)
      let thumbUrl = "";
      if (thumbnail) {
        const thumbRef = ref(storage, `marketplace/thumbs/${Date.now()}_${thumbnail.name}`);
        await uploadBytes(thumbRef, thumbnail);
        thumbUrl = await getDownloadURL(thumbRef);
      }

      // 3. Save Product Record
      await addDoc(collection(db, "products"), {
        title,
        description,
        price: Number(price),
        category,
        pdfUrl,
        thumbnail: thumbUrl || "https://picsum.photos/seed/doc/800/600",
        creatorId: user.uid,
        creatorName: profile?.name || "Verified Creator",
        downloads: 0,
        rating: 4.8,
        reviewsCount: 0,
        createdAt: Date.now()
      });

      toast({ title: "Product Live!", description: "Your resource is now available in the marketplace." });
      router.push('/creator');
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Link href="/creator">
            <Button variant="ghost" size="icon" className="rounded-full border border-white/5 bg-zinc-900/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Publish Resource</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Form Section */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resource Title</Label>
                  <Input 
                    placeholder="e.g. Maharaja Ranjit Singh: Battle Short Notes" 
                    className="h-12 bg-zinc-800/50 border-white/5 rounded-2xl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 bg-zinc-800/50 border-white/5 rounded-2xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {["Punjab GK", "Reasoning", "Math", "PCS", "Patwari", "Current Affairs"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price (INR)</Label>
                    <Input 
                      type="number" 
                      placeholder="99" 
                      className="h-12 bg-zinc-800/50 border-white/5 rounded-2xl"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Deep Description</Label>
                  <Textarea 
                    placeholder="Highlight what's inside (e.g. 50+ PYQs, Flowcharts, Mnemonics)" 
                    className="min-h-[150px] bg-zinc-800/50 border-white/5 rounded-3xl"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[40px] space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                   <Upload className="w-4 h-4 text-primary" />
                   Artifact Upload
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
                     <FileText className="w-8 h-8 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">PDF Store</p>
                     <Input 
                       type="file" 
                       accept=".pdf" 
                       className="hidden" 
                       id="pdf-upload" 
                       onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                     />
                     <Button asChild variant="outline" className="h-10 rounded-xl bg-zinc-800/50 border-white/5 text-xs font-bold">
                        <label htmlFor="pdf-upload" className="cursor-pointer">{pdfFile ? pdfFile.name : "Select PDF"}</label>
                     </Button>
                  </div>

                  <div className="p-6 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-accent/50 transition-colors">
                     <ImageIcon className="w-8 h-8 text-muted-foreground mb-4 group-hover:text-accent transition-colors" />
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Cover Image</p>
                     <Input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       id="thumb-upload" 
                       onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                     />
                     <Button asChild variant="outline" className="h-10 rounded-xl bg-zinc-800/50 border-white/5 text-xs font-bold">
                        <label htmlFor="thumb-upload" className="cursor-pointer">{thumbnail ? thumbnail.name : "Select Image"}</label>
                     </Button>
                  </div>
                </div>
              </div>
           </div>

           {/* Sidebar: Actions/Policy */}
           <div className="space-y-6">
              <Card className="rounded-[40px] p-8 cracklix-glass border-primary/20 bg-primary/5">
                <h4 className="font-bold text-lg mb-6">Publication Summary</h4>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Base Price</span>
                      <span className="font-bold">₹{price || 0}</span>
                   </div>
                   <div className="flex justify-between text-sm border-b border-white/5 pb-4">
                      <span className="text-zinc-500">Platform Fee (20%)</span>
                      <span className="text-destructive font-bold">- ₹{(Number(price) * 0.2).toFixed(1)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-black pt-2">
                      <span>Your Profit</span>
                      <span className="text-emerald-500">₹{(Number(price) * 0.8).toFixed(1)}</span>
                   </div>
                </div>

                <Button 
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Publication"}
                </Button>
              </Card>

              <div className="p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 space-y-4">
                 <h5 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Guidelines</h5>
                 <ul className="space-y-3">
                   {[
                     "Notes must be original content.",
                     "Handwritten scans must be legible.",
                     "Copyright materials are prohibited.",
                     "Withdrawals available after ₹500."
                   ].map((item, i) => (
                     <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {item}
                     </li>
                   ))}
                 </ul>
              </div>
           </div>
        </div>
      </div>
      <Navbar />
    </AppLayout>
  );
}
