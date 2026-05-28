import AdminSidebar from "@/components/admin/sidebar";
import MockBuilder from "@/components/admin/mock-builder";

export default function MockAdminPage() {
  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl font-bold mb-8">Mock Test Factory</h1>
          <MockBuilder />
        </div>
      </main>
    </div>
  );
}
