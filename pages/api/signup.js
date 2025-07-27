import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { fullname, username, email, password, usertype } = req.body;
  if (!fullname || !username || !email || !password || !usertype) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Username or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (fullname, username, email, password, usertype) VALUES ($1, $2, $3, $4, $5)",
      [fullname, username, email, hashedPassword, usertype]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
}
