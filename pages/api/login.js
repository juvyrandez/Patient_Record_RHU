import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

  try {
    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check in users table (for admin and staff)
    const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = userQuery.rows[0];

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      // Record login history
      await pool.query(
        "INSERT INTO login_history (user_id, user_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
        [user.id, user.usertype, ipAddress, userAgent]
      );

      return res.status(200).json({
        message: "Login successful",
        usertype: user.usertype,
        fullname: user.fullname,
        id: user.id
      });
    }

    // Check in doctors table
    const doctorQuery = await pool.query("SELECT * FROM doctors WHERE username = $1", [username]);
    const doctor = doctorQuery.rows[0];

    if (doctor) {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      // Record login history
      await pool.query(
        "INSERT INTO login_history (user_id, user_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
        [doctor.id, 'doctor', ipAddress, userAgent]
      );

      return res.status(200).json({
        message: "Login successful",
        usertype: "doctor",
        fullname: doctor.fullname,
        id: doctor.id
      });
    }

    // Check in bhws table
    const bhwQuery = await pool.query("SELECT * FROM bhws WHERE username = $1", [username]);
    const bhw = bhwQuery.rows[0];

    if (bhw) {
      const isMatch = await bcrypt.compare(password, bhw.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

      // Record login history
      await pool.query(
        "INSERT INTO login_history (user_id, user_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
        [bhw.id, 'bhw', ipAddress, userAgent]
      );

      return res.status(200).json({
        message: "Login successful",
        usertype: "bhw",
        fullname: bhw.fullname,
        id: bhw.id
      });
    }

    return res.status(401).json({ message: "Invalid username or password" });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}