
import bcrypt from "bcryptjs";
import { db } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
  const passwordHash = await bcrypt.hash("nhujan", 10);
  await db.insert(users).values({
    email: "nhujan@example.com",
    passwordHash,
    name: "Nhujan Dongol",
  });
}
main();