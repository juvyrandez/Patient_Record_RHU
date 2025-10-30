import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single rabies registry entry
          const { rows } = await pool.query(
            'SELECT * FROM rabies_registry WHERE id = $1',
            [id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Rabies registry entry not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all rabies registry entries
          const { rows } = await pool.query(`
            SELECT r.*, p.first_name, p.last_name, p.middle_name, p.birth_date, p.gender, p.residential_address,
                   TO_CHAR(r.cat_ii_date, 'YYYY-MM-DD') as cat_ii_date_formatted,
                   TO_CHAR(r.cat_iii_date, 'YYYY-MM-DD') as cat_iii_date_formatted
            FROM rabies_registry r
            LEFT JOIN patients p ON r.patient_id = p.id
            ORDER BY r.created_at DESC
          `);
          
          // Format dates to ensure they're in YYYY-MM-DD format
          const formattedRows = rows.map(row => ({
            ...row,
            cat_ii_date: row.cat_ii_date_formatted || row.cat_ii_date,
            cat_iii_date: row.cat_iii_date_formatted || row.cat_iii_date
          }));
          
          res.status(200).json(formattedRows);
        }
        break;

      case 'POST':
        // Create new rabies registry entry
        const {
          patient_id,
          patient_name,
          age_sex,
          address,
          exposure_category,
          animal,
          cat_ii_date,
          cat_ii_vac,
          cat_iii_date,
          cat_iii_vac,
          notes
        } = req.body;

        // Validate required fields
        if (!patient_id || !patient_name || !age_sex || !address) {
          return res.status(400).json({ 
            message: 'Patient ID, name, age/sex, and address are required' 
          });
        }

        try {
          // Debug logging
          console.log('Rabies Registry API - Received data:', {
            patient_id, patient_name, age_sex, address, exposure_category,
            animal, cat_ii_date, cat_ii_vac, cat_iii_date, cat_iii_vac, notes
          });
          
          // Use UPSERT (INSERT ... ON CONFLICT ... DO UPDATE) to update existing records
          const { rows: [entry] } = await pool.query(`
            INSERT INTO rabies_registry (
              patient_id, patient_name, age_sex, address, exposure_category,
              animal, cat_ii_date, cat_ii_vac, cat_iii_date, cat_iii_vac, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (patient_id) DO UPDATE SET
              patient_name = EXCLUDED.patient_name,
              age_sex = EXCLUDED.age_sex,
              address = EXCLUDED.address,
              exposure_category = EXCLUDED.exposure_category,
              animal = EXCLUDED.animal,
              cat_ii_date = EXCLUDED.cat_ii_date,
              cat_ii_vac = EXCLUDED.cat_ii_vac,
              cat_iii_date = EXCLUDED.cat_iii_date,
              cat_iii_vac = EXCLUDED.cat_iii_vac,
              notes = EXCLUDED.notes,
              updated_at = NOW()
            RETURNING *
          `, [
            patient_id, patient_name, age_sex, address, exposure_category,
            animal, 
            cat_ii_date && cat_ii_date.trim() !== '' ? cat_ii_date : null, 
            cat_ii_vac || false, 
            cat_iii_date && cat_iii_date.trim() !== '' ? cat_iii_date : null, 
            cat_iii_vac || false, 
            notes
          ]);

          res.status(200).json(entry);
        } catch (error) {
          throw error;
        }
        break;

      case 'PUT':
        // Update existing rabies registry entry
        if (!id) {
          return res.status(400).json({ message: 'ID is required for update' });
        }

        const updateData = req.body;
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.keys(updateData).forEach(key => {
          if (key !== 'id' && updateData[key] !== undefined) {
            updateFields.push(`${key} = $${paramIndex}`);
            updateValues.push(updateData[key]);
            paramIndex++;
          }
        });

        if (updateFields.length === 0) {
          return res.status(400).json({ message: 'No fields to update' });
        }

        updateValues.push(id);
        const { rows: [updatedEntry] } = await pool.query(`
          UPDATE rabies_registry 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `, updateValues);

        if (!updatedEntry) {
          return res.status(404).json({ message: 'Rabies registry entry not found' });
        }

        res.status(200).json(updatedEntry);
        break;

      case 'DELETE':
        // Delete rabies registry entry
        if (!id) {
          return res.status(400).json({ message: 'ID is required for deletion' });
        }

        const { rows: [deletedEntry] } = await pool.query(
          'DELETE FROM rabies_registry WHERE id = $1 RETURNING *',
          [id]
        );

        if (!deletedEntry) {
          return res.status(404).json({ message: 'Rabies registry entry not found' });
        }

        res.status(200).json({ message: 'Rabies registry entry deleted successfully' });
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
