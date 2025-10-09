import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { treatment_record_id, doctor_id, status } = req.query;
      
      let query = `
        SELECT cd.*, u.username as doctor_name,
               itr.patient_first_name, itr.patient_last_name, itr.consultation_date
        FROM consultation_decisions cd
        LEFT JOIN users u ON cd.doctor_id = u.id
        LEFT JOIN individual_treatment_records itr ON cd.treatment_record_id = itr.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (treatment_record_id) {
        paramCount++;
        query += ` AND cd.treatment_record_id = $${paramCount}`;
        params.push(treatment_record_id);
      }

      if (doctor_id) {
        paramCount++;
        query += ` AND cd.doctor_id = $${paramCount}`;
        params.push(doctor_id);
      }

      if (status) {
        paramCount++;
        query += ` AND cd.status = $${paramCount}`;
        params.push(status);
      }

      query += ' ORDER BY cd.updated_at DESC';

      const result = await pool.query(query, params);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching consultation decisions:', error);
      return res.status(500).json({ error: 'Failed to fetch consultation decisions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        treatment_record_id,
        doctor_id,
        status,
        medication_treatment,
        lab_findings_impression,
        lab_tests,
        notes,
        is_draft
      } = req.body;

      if (!treatment_record_id || !doctor_id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if a decision already exists for this treatment record
      const existingResult = await pool.query(
        'SELECT id FROM consultation_decisions WHERE treatment_record_id = $1',
        [treatment_record_id]
      );

      let result;
      if (existingResult.rows.length > 0) {
        // Update existing decision
        const completed_at = status === 'Complete' && !is_draft ? 'NOW()' : 'NULL';
        result = await pool.query(
          `UPDATE consultation_decisions 
           SET status = $1,
               medication_treatment = $2,
               lab_findings_impression = $3,
               lab_tests = $4,
               notes = $5,
               is_draft = $6,
               completed_at = ${completed_at},
               updated_at = NOW()
           WHERE treatment_record_id = $7
           RETURNING *`,
          [
            status,
            medication_treatment,
            lab_findings_impression,
            lab_tests,
            notes,
            is_draft,
            treatment_record_id
          ]
        );
      } else {
        // Create new decision
        const completed_at = status === 'Complete' && !is_draft ? new Date() : null;
        result = await pool.query(
          `INSERT INTO consultation_decisions 
           (treatment_record_id, doctor_id, status, medication_treatment, 
            lab_findings_impression, lab_tests, notes, is_draft, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            treatment_record_id,
            doctor_id,
            status,
            medication_treatment,
            lab_findings_impression,
            lab_tests,
            notes,
            is_draft,
            completed_at
          ]
        );
      }

      // Also update the individual_treatment_records status
      await pool.query(
        'UPDATE individual_treatment_records SET status = $1 WHERE id = $2',
        [status.toLowerCase(), treatment_record_id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating/updating consultation decision:', error);
      return res.status(500).json({ error: 'Failed to save consultation decision' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const {
        status,
        medication_treatment,
        lab_findings_impression,
        lab_tests,
        notes,
        is_draft
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Decision ID is required' });
      }

      const completed_at = status === 'Complete' && !is_draft ? 'NOW()' : 'NULL';
      const result = await pool.query(
        `UPDATE consultation_decisions 
         SET status = COALESCE($1, status),
             medication_treatment = COALESCE($2, medication_treatment),
             lab_findings_impression = COALESCE($3, lab_findings_impression),
             lab_tests = COALESCE($4, lab_tests),
             notes = COALESCE($5, notes),
             is_draft = COALESCE($6, is_draft),
             completed_at = ${completed_at},
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [status, medication_treatment, lab_findings_impression, lab_tests, notes, is_draft, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultation decision not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating consultation decision:', error);
      return res.status(500).json({ error: 'Failed to update consultation decision' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Decision ID is required' });
      }

      const result = await pool.query(
        'DELETE FROM consultation_decisions WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consultation decision not found' });
      }

      return res.status(200).json({ message: 'Consultation decision deleted successfully' });
    } catch (error) {
      console.error('Error deleting consultation decision:', error);
      return res.status(500).json({ error: 'Failed to delete consultation decision' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
