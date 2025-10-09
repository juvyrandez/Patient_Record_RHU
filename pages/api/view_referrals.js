import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single referral with patient info
          const { rows } = await pool.query(`
            SELECT r.*, 
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   p.middle_name as patient_middle_name,
                   p.residential_address as patient_address
            FROM referrals r
            JOIN patients p ON r.patient_id = p.id
            WHERE r.id = $1
          `, [id]);
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Referral not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all referrals with patient info
          const { rows } = await pool.query(`
            SELECT r.*, 
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   p.middle_name as patient_middle_name,
                   p.residential_address as patient_address
            FROM referrals r
            JOIN patients p ON r.patient_id = p.id
            ORDER BY r.created_at DESC
          `);
          res.status(200).json(rows);
        }
        break;

      case 'PUT':
        // Update referral status
        const { status } = req.body;
        
        if (!id || !status) {
          return res.status(400).json({ message: 'ID and status are required' });
        }

        // Validate status value
        if (!['Pending', 'In Laboratory', 'Complete'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }

        const { rows: [updatedReferral] } = await pool.query(
          `UPDATE referrals 
           SET status = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING *`,
          [status, id]
        );

        if (!updatedReferral) {
          return res.status(404).json({ message: 'Referral not found' });
        }

        res.status(200).json(updatedReferral);
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}