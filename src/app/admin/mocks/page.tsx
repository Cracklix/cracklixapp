
import AdminSidebar from "@/components/admin/sidebar";
import MockBuilder from "@/components/admin/mock-builder";
import AIMockBuilder from "@/components/admin/ai-mock-builder";

export default function MockAdminPage() {
  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold">Mock Test Factory</h1>
            <p className="text-zinc-500 mt-2">Create manual simulations or let our AI synthesize high-yield mocks.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <MockBuilder />
            <AIMockBuilder />
          </div>
        </div>
      </main>
    </div>
  );
}
