import { db } from "../src/db";
import { workCategories } from "../src/db/schema";

async function main() {
  await db
    .insert(workCategories)
    .values({
      slug: "default",
      title: "Default Background",
      subtext: "",
      order: 0,
      isDefault: true,
    })
    .onConflictDoNothing({ target: workCategories.slug });

  console.log("Seeded default category.");
}
main();