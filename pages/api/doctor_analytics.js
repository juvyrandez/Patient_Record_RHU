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

    // Top diagnoses from approved_diagnoses table
    const diseasesResult = await pool.query(`
      SELECT 
        TRIM(diagnosis_text) AS diagnosis, 
        COUNT(*)::int AS count
      FROM approved_diagnoses
      WHERE COALESCE(TRIM(diagnosis_text), '') <> ''
      GROUP BY TRIM(diagnosis_text)
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

    // Analytics data - diagnosis type distribution from approved_diagnoses
    const analyticsResult = await pool.query(`
      SELECT 
        diagnosis_type,
        COUNT(*)::int AS count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
      FROM approved_diagnoses
      GROUP BY diagnosis_type
      ORDER BY count DESC
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

    // Pending consultations from consultation_decisions table
    // Definition: records with status 'Pending' or no decision record yet
    const pendingResult = await pool.query(`
      SELECT COUNT(*)::int AS pending
      FROM individual_treatment_records itr
      LEFT JOIN consultation_decisions cd ON itr.id = cd.treatment_record_id
      WHERE cd.status IS NULL OR cd.status = 'Pending'
    `);

    const analytics = {
      totalConsultations: consultationsResult.rows[0]?.total_consultations || 0,
      totalPatients: patientsResult.rows[0]?.total_patients || 0,
      totalHistory: historyResult.rows[0]?.total_history || 0,
      pendingConsultations: pendingResult.rows[0]?.pending || 0,
      monthlyConsultations: monthlyConsultationsResult.rows || [],
      topDiseases: diseasesResult.rows || [],
      statusDistribution: statusResult.rows || [],
      diagnosisAnalytics: analyticsResult.rows || []
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
