import pool from '@/lib/db';

export default async function handler(req, res) {
  const { type } = req.query;

  try {
    let query = `
      SELECT lh.*, 
             COALESCE(u.fullname, d.fullname, b.fullname) as fullname,
             COALESCE(u.username, d.username, b.username) as username
      FROM login_history lh
      LEFT JOIN users u ON lh.user_id = u.id AND (lh.user_type = 'admin' OR lh.user_type = 'staff')
      LEFT JOIN doctors d ON lh.user_id = d.id AND lh.user_type = 'doctor'
      LEFT JOIN bhws b ON lh.user_id = b.id AND lh.user_type = 'bhw'
    `;

    const params = [];
    
    if (type && type !== 'all') {
      query += ' WHERE lh.user_type = $1';
      params.push(type);
    }

    query += ' ORDER BY lh.login_time DESC LIMIT 100';

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Error fetching login history', error: error.message });
  }
}