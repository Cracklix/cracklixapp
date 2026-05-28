import AdminSidebar from "@/components/admin/sidebar";
import PDFUpload from "@/components/admin/pdf-upload";
import { Newspaper } from "lucide-react";

export default function AdminCurrentAffairsPage() {
  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
              <Newspaper className="w-10 h-10 text-primary" />
              Content Management
            </h1>
            <p className="text-zinc-500 mt-2">Manage current affairs, study materials, and resource PDFs.</p>
          </div>
          
          <PDFUpload />
        </div>
      </main>
    </div>
  );
}