
import AdminSidebar from "@/components/admin/sidebar";
import AdminGuard from "@/components/admin-guard";
import PYQForm from "@/components/admin/pyq-form";
import { History } from "lucide-react";

export default function AdminPYQsPage() {
  return (
    <AdminGuard>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 space-y-2">
              <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
                <History className="w-10 h-10 text-orange-500" />
                Previous Papers Manager
              </h1>
              <p className="text-zinc-500">Inject official historical questions into the ecosystem.</p>
            </div>
            
            <PYQForm />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
