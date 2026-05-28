
import AdminSidebar from "@/components/admin/sidebar";
import AdminGuard from "@/components/admin-guard";
import NotificationSender from "@/components/admin/notification-sender";
import { Bell } from "lucide-react";

export default function AdminNotificationsPage() {
  return (
    <AdminGuard>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 space-y-2">
              <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
                <Bell className="w-10 h-10 text-primary" />
                Communications Command
              </h1>
              <p className="text-zinc-500">Broadcast updates, achievements, and critical notices to the student base.</p>
            </div>
            
            <NotificationSender />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
