import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { treatment_record_id } = req.query;
      
      if (treatment_record_id) {
        // Get approved diagnoses for a specific treatment record
        const result = await pool.query(
          `SELECT ad.*, u.username as approved_by_name 
           FROM approved_diagnoses ad
           LEFT JOIN users u ON ad.approved_by = u.id
           WHERE ad.treatment_record_id = $1
           ORDER BY ad.is_primary DESC, ad.created_at ASC`,
          [treatment_record_id]
        );
        return res.status(200).json(result.rows);
      } else {
        // Get all approved diagnoses
        const result = await pool.query(
          `SELECT ad.*, u.username as approved_by_name,
                  itr.patient_first_name, itr.patient_last_name
           FROM approved_diagnoses ad
           LEFT JOIN users u ON ad.approved_by = u.id
           LEFT JOIN individual_treatment_records itr ON ad.treatment_record_id = itr.id
           ORDER BY ad.created_at DESC`
        );
        return res.status(200).json(result.rows);
      }
    } catch (error) {
      console.error('Error fetching approved diagnoses:', error);
      return res.status(500).json({ error: 'Failed to fetch approved diagnoses' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        treatment_record_id, 
        diagnoses, // Array of diagnosis objects
        approved_by 
      } = req.body;

      if (!treatment_record_id || !diagnoses || !Array.isArray(diagnoses)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Delete existing approved diagnoses for this treatment record
      await pool.query(
        'DELETE FROM approved_diagnoses WHERE treatment_record_id = $1',
        [treatment_record_id]
      );

      // Insert new approved diagnoses
      const insertPromises = diagnoses.map((diagnosis, index) => {
        return pool.query(
          `INSERT INTO approved_diagnoses 
           (treatment_record_id, diagnosis_text, diagnosis_type, is_primary, approved_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            treatment_record_id,
            diagnosis.text,
            diagnosis.type || 'final',
            index === 0, // First diagnosis is primary
            approved_by
          ]
        );
      });

      const results = await Promise.all(insertPromises);
      const insertedDiagnoses = results.map(result => result.rows[0]);

      return res.status(201).json(insertedDiagnoses);
    } catch (error) {
      console.error('Error creating approved diagnoses:', error);
      return res.status(500).json({ error: 'Failed to create approved diagnoses' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { diagnosis_text, diagnosis_type, is_primary } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Diagnosis ID is required' });
      }

      const result = await pool.query(
        `UPDATE approved_diagnoses 
         SET diagnosis_text = COALESCE($1, diagnosis_text),
             diagnosis_type = COALESCE($2, diagnosis_type),
             is_primary = COALESCE($3, is_primary),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [diagnosis_text, diagnosis_type, is_primary, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Approved diagnosis not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating approved diagnosis:', error);
      return res.status(500).json({ error: 'Failed to update approved diagnosis' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Diagnosis ID is required' });
      }

      const result = await pool.query(
        'DELETE FROM approved_diagnoses WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Approved diagnosis not found' });
      }

      return res.status(200).json({ message: 'Approved diagnosis deleted successfully' });
    } catch (error) {
      console.error('Error deleting approved diagnosis:', error);
      return res.status(500).json({ error: 'Failed to delete approved diagnosis' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
