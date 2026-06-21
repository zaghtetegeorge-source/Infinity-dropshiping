import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav adminName={session.name} />
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
