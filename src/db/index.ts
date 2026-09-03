import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://neondb_owner:npg_cp4Mq0xkJBtn@ep-dark-heart-azl90vp0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });