import jwt from "jsonwebtoken";
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default async function handler(req, res) {
  // Get token from cookie
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch complete user data from database based on user type
    let userData = null;
    
    switch (decoded.usertype) {
      case 'admin':
        // For admin, get from users table
        const { rows: adminRows } = await pool.query(
          'SELECT id, fullname, username, email, usertype FROM users WHERE id = $1',
          [decoded.id]
        );
        userData = adminRows[0];
        break;
        
      case 'staff':
        // For staff, get from users table
        const { rows: staffRows } = await pool.query(
          'SELECT id, fullname, username, email, usertype FROM users WHERE id = $1',
          [decoded.id]
        );
        userData = staffRows[0];
        break;
        
      case 'doctor':
        // For doctors, get from doctors table
        const { rows: doctorRows } = await pool.query(
          'SELECT id, fullname, username, email, specialization FROM doctors WHERE id = $1',
          [decoded.id]
        );
        if (doctorRows[0]) {
          userData = {
            ...doctorRows[0],
            usertype: 'doctor'
          };
        }
        break;
        
      case 'bhw':
        // For BHWs, get from bhws table
        const { rows: bhwRows } = await pool.query(
          'SELECT id, fullname, username, email, barangay, contact_number FROM bhws WHERE id = $1',
          [decoded.id]
        );
        if (bhwRows[0]) {
          userData = {
            ...bhwRows[0],
            usertype: 'bhw'
          };
        }
        break;
        
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }
    
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return complete user data
    res.status(200).json(userData);
    
  } catch (error) {
    console.error("Profile fetch failed:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}