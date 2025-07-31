import pool from '@/lib/db';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        // Fetch all notifications, ordered by most recent
        const { rows } = await pool.query(`
          SELECT id, referral_id, message, type, 
                 TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as time
          FROM notifications
          ORDER BY created_at DESC
        `);
        res.status(200).json(rows);
        break;

      case 'DELETE':
        // Clear all notifications
        await pool.query('DELETE FROM notifications');
        res.status(200).json({ message: 'All notifications cleared' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}