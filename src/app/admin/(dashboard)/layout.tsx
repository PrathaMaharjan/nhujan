import { signOut, auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminShell } from "./admin-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  const displayName = currentUser?.name || session.user.name || "Admin";

  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <AdminShell displayName={displayName} logoutAction={handleLogout}>
      {children}
    </AdminShell>
  );
}