import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
    columns: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;

  const updates: Partial<typeof users.$inferInsert> = {};

  // If changing name
  if (typeof name === "string") {
    updates.name = name.trim();
  }

  // If changing email
  if (email && typeof email === "string" && email.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if new email is already in use by another user
    const existing = await db.query.users.findFirst({
      where: and(eq(users.email, cleanEmail), ne(users.id, currentUser.id)),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email is already in use by another account" },
        { status: 400 }
      );
    }

    // Require current password when updating email
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to change your email address" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    updates.email = cleanEmail;
  }

  // If changing password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to set a new password" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    updates.passwordHash = hashed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "No changes detected" });
  }

  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, currentUser.id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  return NextResponse.json({
    success: true,
    user: updatedUser,
    emailChanged: updates.email !== undefined,
  });
}
