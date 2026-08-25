import { signOut, auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarNav } from "./sidebar";
import { LogOut } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  const displayName = currentUser?.name || session.user.name || "Admin";
  const displayEmail = currentUser?.email || session.user.email;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-60 shrink-0 border-r border-white/10 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-2 mb-3">

            <div className="min-w-0">
              <p className="text-2xl font-medium truncate">{displayName}</p>

            </div>

          </div>
          <div className="border-t border-white/10 pt-4"></div>
          <SidebarNav />
        </div>

        <div className="border-t border-white/10 pt-4">

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              <LogOut size={16} strokeWidth={2} />
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}