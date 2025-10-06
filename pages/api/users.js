// pages/api/users.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    if (req.method === "GET") {
      const { rows } = await client.query("SELECT id, fullname, username, email FROM users");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { fullname, username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.query(
        "INSERT INTO users (fullname, username, email, password, usertype) VALUES ($1, $2, $3, $4, $5)",
        [fullname, username, email, hashedPassword, "staff"]
      );

      return res.status(201).json({ message: "User created successfully" });
    }

    if (req.method === "PUT") {
      const { id, fullname, username, email, password } = req.body;

      if (password) {
        // Update with new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
          "UPDATE users SET fullname = $1, username = $2, email = $3, password = $4 WHERE id = $5",
          [fullname, username, email, hashedPassword, id]
        );
      } else {
        // Update without changing password
        await client.query(
          "UPDATE users SET fullname = $1, username = $2, email = $3 WHERE id = $4",
          [fullname, username, email, id]
        );
      }

      return res.status(200).json({ message: "User updated successfully" });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;

      await client.query("DELETE FROM users WHERE id = $1", [id]);
      return res.status(200).json({ message: "User deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ message: "Username or email already exists " });
  } finally {
    client.release();
  }
}
