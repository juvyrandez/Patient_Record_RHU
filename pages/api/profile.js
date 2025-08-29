import jwt from "jsonwebtoken";

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
    
    // Return user data (you might want to fetch from DB here)
    res.status(200).json({
      id: decoded.id,
      username: decoded.username,
      fullname: decoded.fullname,
      usertype: decoded.usertype,
      email: decoded.email
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}