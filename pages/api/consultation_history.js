import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { patient_id } = req.query;

      if (!patient_id) {
        return res.status(400).json({ error: 'Patient ID is required' });
      }

      // Fetch all consultation records for the patient with doctor decisions, diagnoses, and patient info
      const query = `
        SELECT 
          itr.*,
          cd.status as decision_status,
          cd.medication_treatment,
          cd.lab_findings_impression,
          cd.lab_tests as decision_lab_tests,
          cd.notes as doctor_notes,
          cd.completed_at,
          u.username as doctor_name,
          u.fullname as doctor_fullname,
          p.last_name as patient_last_name,
          p.first_name as patient_first_name,
          p.middle_name as patient_middle_name,
          p.suffix as patient_suffix,
          p.gender as patient_gender,
          p.birth_date as patient_birth_date,
          p.residential_address as patient_address,
          (
            SELECT STRING_AGG(diagnosis_text, ', ' ORDER BY id)
            FROM approved_diagnoses
            WHERE treatment_record_id = itr.id
          ) as diagnoses
        FROM individual_treatment_records itr
        LEFT JOIN consultation_decisions cd ON itr.id = cd.treatment_record_id
        LEFT JOIN users u ON cd.doctor_id = u.id
        LEFT JOIN patients p ON itr.patient_id = p.id
        WHERE itr.patient_id = $1
        ORDER BY itr.consultation_date DESC, itr.consultation_time DESC
      `;

      const result = await pool.query(query, [patient_id]);
      
      console.log(`Consultation history query for patient ${patient_id}: Found ${result.rows.length} records`);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching consultation history:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Failed to fetch consultation history',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
