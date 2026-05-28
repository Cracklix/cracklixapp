
import SuperSidebar from "@/components/super/sidebar";
import SuperAdminProtect from "@/components/super/super-protect";
import AdminManager from "@/components/super/admin-manager";

export default function AdminManagementPage() {
  return (
    <SuperAdminProtect>
      <div className="flex bg-black min-h-screen">
        <SuperSidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-headline text-4xl font-bold text-white mb-10">Access Control</h1>
            <AdminManager />
          </div>
        </main>
      </div>
    </SuperAdminProtect>
  );
}
