import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Total consultations from individual_treatment_records
    const consultationsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_consultations
      FROM individual_treatment_records
    `);

    // Consultations by month (last 6 months) from individual_treatment_records
    const monthlyConsultationsResult = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', consultation_date), 'Mon YYYY') AS month,
        COUNT(*)::int AS count
      FROM individual_treatment_records
      WHERE consultation_date IS NOT NULL
        AND consultation_date >= (CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', consultation_date)
      ORDER BY DATE_TRUNC('month', consultation_date)
    `);

    // Top diagnoses aggregated from diagnosis_1..3 and diagnosis notes
    const diseasesResult = await pool.query(`
      WITH diagnoses AS (
        SELECT TRIM(diagnosis_1) AS dx FROM individual_treatment_records WHERE COALESCE(TRIM(diagnosis_1), '') <> ''
        UNION ALL
        SELECT TRIM(diagnosis_2) FROM individual_treatment_records WHERE COALESCE(TRIM(diagnosis_2), '') <> ''
        UNION ALL
        SELECT TRIM(diagnosis_3) FROM individual_treatment_records WHERE COALESCE(TRIM(diagnosis_3), '') <> ''
        UNION ALL
        SELECT TRIM(diagnosis) FROM individual_treatment_records WHERE COALESCE(TRIM(diagnosis), '') <> ''
      )
      SELECT dx AS diagnosis, COUNT(*)::int AS count
      FROM diagnoses
      GROUP BY dx
      ORDER BY count DESC
      LIMIT 10
    `);

    // Visit type distribution (as status distribution substitute)
    const statusResult = await pool.query(`
      SELECT 
        COALESCE(visit_type, 'Unknown') AS status,
        COUNT(*)::int AS count
      FROM individual_treatment_records
      GROUP BY COALESCE(visit_type, 'Unknown')
      ORDER BY count DESC
    `);

    // Recent consultations from individual_treatment_records joined with patients
    const recentConsultationsResult = await pool.query(`
      SELECT 
        itr.id,
        itr.patient_id,
        COALESCE(itr.patient_first_name, p.first_name) AS first_name,
        COALESCE(itr.patient_last_name, p.last_name) AS last_name,
        itr.consultation_date,
        COALESCE(NULLIF(itr.diagnosis, ''), itr.diagnosis_1, itr.diagnosis_2, itr.diagnosis_3) AS diagnosis,
        COALESCE(itr.visit_type, 'Completed') AS status
      FROM individual_treatment_records itr
      LEFT JOIN patients p ON itr.patient_id = p.id
      ORDER BY COALESCE(itr.consultation_date, DATE_TRUNC('day', NOW())) DESC, itr.id DESC
      LIMIT 5
    `);

    // Total patients count
    const patientsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_patients FROM patients
    `);

    // Total history: completed records proxy (any diagnosis provided)
    const historyResult = await pool.query(`
      SELECT COUNT(*)::int AS total_history
      FROM individual_treatment_records
      WHERE COALESCE(TRIM(diagnosis), '') <> ''
         OR COALESCE(TRIM(diagnosis_1), '') <> ''
         OR COALESCE(TRIM(diagnosis_2), '') <> ''
         OR COALESCE(TRIM(diagnosis_3), '') <> ''
    `);

    // Pending consultations derived from individual_treatment_records
    // Definition: records with no diagnosis provided yet
    const pendingResult = await pool.query(`
      SELECT COUNT(*)::int AS pending
      FROM individual_treatment_records
      WHERE COALESCE(TRIM(diagnosis), '') = ''
        AND COALESCE(TRIM(diagnosis_1), '') = ''
        AND COALESCE(TRIM(diagnosis_2), '') = ''
        AND COALESCE(TRIM(diagnosis_3), '') = ''
    `);

    const analytics = {
      totalConsultations: consultationsResult.rows[0]?.total_consultations || 0,
      totalPatients: patientsResult.rows[0]?.total_patients || 0,
      totalHistory: historyResult.rows[0]?.total_history || 0,
      pendingConsultations: pendingResult.rows[0]?.pending || 0,
      monthlyConsultations: monthlyConsultationsResult.rows || [],
      topDiseases: diseasesResult.rows || [],
      statusDistribution: statusResult.rows || [],
      recentConsultations: recentConsultationsResult.rows || []
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching doctor analytics:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
