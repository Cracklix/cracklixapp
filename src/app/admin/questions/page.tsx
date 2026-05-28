
import AdminSidebar from "@/components/admin/sidebar";
import AdminProtect from "@/components/admin/admin-protect";
import QuestionForm from "@/components/admin/question-form";

export default function QuestionsPage() {
  return (
    <AdminProtect>
      <div className="flex bg-black min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-headline text-4xl font-bold mb-8">Question Management</h1>
            <QuestionForm />
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
