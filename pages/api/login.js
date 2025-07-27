import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

  try {
    // Check in users table
    const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = userQuery.rows[0];

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      return res.status(200).json({
        message: "Login successful",
        usertype: user.usertype,
        fullname: user.fullname,
      });
    }

    // Check in medical_staff table
    const medQuery = await pool.query("SELECT * FROM medical_staff WHERE username = $1", [username]);
    const medStaff = medQuery.rows[0];

    if (medStaff) {
      const isMatch = await bcrypt.compare(password, medStaff.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      return res.status(200).json({
        message: "Login successful",
        usertype: medStaff.type.toLowerCase(),
        fullname: medStaff.fullname,
      });
    }

    // Check in bhws table
    const bhwQuery = await pool.query("SELECT * FROM bhws WHERE username = $1", [username]);
    const bhw = bhwQuery.rows[0];

    if (bhw) {
      const isMatch = await bcrypt.compare(password, bhw.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      return res.status(200).json({
        message: "Login successful",
        usertype: "bhw",
        fullname: bhw.fullname,
      });
    }

    return res.status(401).json({ message: "Invalid username or password" });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
}
