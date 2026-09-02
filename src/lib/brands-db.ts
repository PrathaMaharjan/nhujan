import { neon } from "@neondatabase/serverless";

export const DEFAULT_BRAND_LOGOS = [
  { name: "ADIDAS", imageUrl: "/Adidas_Logo 2.png" },
  { name: "CLOSEUP", imageUrl: "/Closeup logo.png" },
  { name: "UNILEVER", imageUrl: "/brands/Unilever.svg" },
  { name: "DARAZ", imageUrl: "/Daraz_Logo.png" },
  { name: "ESEWA", imageUrl: "/esewa.png" },
  { name: "MERCEDES", imageUrl: "/brands/Mercedes.svg" },
  { name: "SAMSUNG", imageUrl: "/brands/Samsung.svg" },
  { name: "NIKE", imageUrl: "/brands/Nike.svg" },
];

export const DEFAULT_ARTISTS = [
  "Shushant KC",
  "Ujjan Shakya",
  "Sajjan Raj Vaidya",
  "Sushant Ghimire",
  "Nabin K Bhattarai",
  "Albatross",
  "Rohit John Chettri",
  "Bartika Eam Rai",
  "Phosphenes",
  "The Elements",
  "Kutumba",
  "Mingma Sherpa",
  "Yabesh Thapa",
  "Swoopna Suman",
  "Rachana Dahal",
  "Vek",
  "Prabesh Kumar Shrestha",
  "Diwas Gurung",
  "Bipul Chettri",
  "1974 AD",
];

let tablesInitialized = false;

export async function ensureBrandsTables() {
  if (tablesInitialized) return;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      CREATE TABLE IF NOT EXISTS brand_logos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        image_url text NOT NULL,
        public_id text,
        "order" integer NOT NULL DEFAULT 0,
        pos_x real,
        pos_y real,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS artists (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        pos_x real,
        pos_y real,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Ensure columns exist on already created tables
    await sql`ALTER TABLE brand_logos ADD COLUMN IF NOT EXISTS pos_x real;`;
    await sql`ALTER TABLE brand_logos ADD COLUMN IF NOT EXISTS pos_y real;`;
    await sql`ALTER TABLE artists ADD COLUMN IF NOT EXISTS pos_x real;`;
    await sql`ALTER TABLE artists ADD COLUMN IF NOT EXISTS pos_y real;`;

    tablesInitialized = true;
  } catch (err) {
    console.error("Error ensuring brands tables:", err);
  }
}
