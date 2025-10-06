import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username/email and password are required" });

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check if input is email or username
    const isEmail = username.includes('@');
    const searchField = isEmail ? 'email' : 'username';

    // Users table
    let userQuery = await pool.query(`SELECT * FROM users WHERE ${searchField} = $1`, [username]);
    let user = userQuery.rows[0];
    let userType = user?.usertype;

    // Doctors
    if (!user) {
      const doctorQuery = await pool.query(`SELECT * FROM doctors WHERE ${searchField} = $1`, [username]);
      user = doctorQuery.rows[0];
      userType = user ? "doctor" : null;
    }

    // BHWs
    if (!user) {
      const bhwQuery = await pool.query(`SELECT * FROM bhws WHERE ${searchField} = $1`, [username]);
      user = bhwQuery.rows[0];
      userType = user ? "bhw" : null;
    }

    if (!user) return res.status(401).json({ message: "Invalid username/email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid username/email or password" });

    // Record login history
    await pool.query(
      "INSERT INTO login_history (user_id, user_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
      [user.id, userType, ipAddress, userAgent]
    );

    // 🔑 Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        fullname: user.fullname, 
        usertype: userType 
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🍪 Set HttpOnly cookie
    res.setHeader("Set-Cookie", serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
      path: "/",
    }));

    return res.status(200).json({
      message: "Login successful",
      fullname: user.fullname,
      usertype: userType,
      username: user.username
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}