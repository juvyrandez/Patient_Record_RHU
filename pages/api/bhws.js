import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single BHW
          const { rows } = await pool.query(
            'SELECT id, fullname, username, email, barangay, contact_number FROM bhws WHERE id = $1',
            [id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ message: 'BHW not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all BHWs
          const { rows } = await pool.query(
            'SELECT id, fullname, username, email, barangay, contact_number FROM bhws ORDER BY fullname'
          );
          res.status(200).json(rows);
        }
        break;

      case 'POST':
        // Create new BHW
        const { fullname, username, email, password, barangay, contact_number } = req.body;
        
        // Validate required fields
        if (!fullname || !username || !email || !password || !barangay) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing username or email
        const { rows: existing } = await pool.query(
          'SELECT id FROM bhws WHERE username = $1 OR email = $2',
          [username, email]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const { rows: [newBhw] } = await pool.query(
          `INSERT INTO bhws (fullname, username, email, password, barangay, contact_number)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, fullname, username, email, barangay, contact_number`,
          [fullname, username, email, hashedPassword, barangay, contact_number]
        );

        res.status(201).json(newBhw);
        break;

      case 'PUT':
        // Update BHW
        const { 
          fullname: updateName, 
          username: updateUsername, 
          email: updateEmail, 
          barangay: updateBarangay, 
          contact_number: updateContact,
          password: updatePassword 
        } = req.body;

        if (!updateName || !updateUsername || !updateEmail || !updateBarangay) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for conflicts
        const { rows: conflict } = await pool.query(
          'SELECT id FROM bhws WHERE (username = $1 OR email = $2) AND id != $3',
          [updateUsername, updateEmail, id]
        );
        
        if (conflict.length > 0) {
          return res.status(400).json({ message: 'Username or email already in use' });
        }

        let updatedBhw;
        if (updatePassword) {
          // Update with new password
          const hashedPassword = await bcrypt.hash(updatePassword, 10);
          const { rows: [bhw] } = await pool.query(
            `UPDATE bhws 
             SET fullname = $1, username = $2, email = $3, barangay = $4, contact_number = $5, password = $6
             WHERE id = $7
             RETURNING id, fullname, username, email, barangay, contact_number`,
            [updateName, updateUsername, updateEmail, updateBarangay, updateContact, hashedPassword, id]
          );
          updatedBhw = bhw;
        } else {
          // Update without changing password
          const { rows: [bhw] } = await pool.query(
            `UPDATE bhws 
             SET fullname = $1, username = $2, email = $3, barangay = $4, contact_number = $5
             WHERE id = $6
             RETURNING id, fullname, username, email, barangay, contact_number`,
            [updateName, updateUsername, updateEmail, updateBarangay, updateContact, id]
          );
          updatedBhw = bhw;
        }

        res.status(200).json(updatedBhw);
        break;

      case 'DELETE':
        if (!id) return res.status(400).json({ message: 'BHW ID required' });

        const { rowCount } = await pool.query('DELETE FROM bhws WHERE id = $1', [id]);
        
        if (rowCount === 0) {
          return res.status(404).json({ message: 'BHW not found' });
        }

        res.status(200).json({ message: 'BHW deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}