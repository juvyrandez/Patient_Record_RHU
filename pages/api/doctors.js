import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
      
          const { rows } = await pool.query(
            'SELECT id, fullname, username, email, specialization FROM doctors WHERE id = $1',
            [id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
          }
          res.status(200).json(rows[0]);
        } else {
   
          const { rows } = await pool.query(
            'SELECT id, fullname, username, email, specialization FROM doctors ORDER BY fullname'
          );
          res.status(200).json(rows);
        }
        break;

      case 'POST':
        // Create new doctor
        const { fullname, username, email, password, specialization } = req.body;
        
  
        if (!fullname || !username || !email || !password) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing username or email
        const { rows: existing } = await pool.query(
          'SELECT id FROM doctors WHERE username = $1 OR email = $2',
          [username, email]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Username or email already exists' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        const { rows: [newDoctor] } = await pool.query(
          `INSERT INTO doctors (fullname, username, email, password, specialization)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, fullname, username, email, specialization`,
          [fullname, username, email, hashedPassword, specialization]
        );

        res.status(201).json(newDoctor);
        break;

      case 'PUT':
        // Update doctor
        const { fullname: updateName, username: updateUsername, 
                email: updateEmail, specialization: updateSpecialization, password: updatePassword } = req.body;

        if (!updateName || !updateUsername || !updateEmail) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

       
        const { rows: conflict } = await pool.query(
          'SELECT id FROM doctors WHERE (username = $1 OR email = $2) AND id != $3',
          [updateUsername, updateEmail, id]
        );
        
        if (conflict.length > 0) {
          return res.status(400).json({ message: 'Username or email already in use' });
        }

        let updatedDoctor;
        if (updatePassword) {
          // Update with new password
          const hashedPassword = await bcrypt.hash(updatePassword, 10);
          const { rows: [doctor] } = await pool.query(
            `UPDATE doctors 
             SET fullname = $1, username = $2, email = $3, specialization = $4, password = $5
             WHERE id = $6
             RETURNING id, fullname, username, email, specialization`,
            [updateName, updateUsername, updateEmail, updateSpecialization, hashedPassword, id]
          );
          updatedDoctor = doctor;
        } else {
         
          const { rows: [doctor] } = await pool.query(
            `UPDATE doctors 
             SET fullname = $1, username = $2, email = $3, specialization = $4
             WHERE id = $5
             RETURNING id, fullname, username, email, specialization`,
            [updateName, updateUsername, updateEmail, updateSpecialization, id]
          );
          updatedDoctor = doctor;
        }

        res.status(200).json(updatedDoctor);
        break;

      case 'DELETE':
        if (!id) return res.status(400).json({ message: 'Doctor ID required' });

        const { rowCount } = await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
        
        if (rowCount === 0) {
          return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully' });
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