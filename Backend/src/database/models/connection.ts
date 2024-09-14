import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const client = new Pool({
  // connectionString: process.env.POSTGRES_URL
  connectionString: 'postgresql://postgres.fgsyfocqcejybiivrenw:aniket1k2k3k@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  // host : "localhost",
  // user : "postgres",
  // port : 5432,
  // password : "aniket123",
  // database : "newdb1"
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database");

    // Perform database operations here
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

connectToDatabase();
