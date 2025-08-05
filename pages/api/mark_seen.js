import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE referrals 
       SET seen = TRUE, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}