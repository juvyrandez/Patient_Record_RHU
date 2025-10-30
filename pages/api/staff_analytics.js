import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const client = await pool.connect();
  try {
    // Core counts
    const [patientsRes, referralsRes, completedReferralsRes, diagnosesRes] = await Promise.all([
      client.query("SELECT COUNT(*)::int AS count FROM patients WHERE type = 'staff_data'"),
      client.query('SELECT COUNT(*)::int AS count FROM referrals'),
      // "status" may not exist in all schemas; default to 0 if column is missing
      client
        .query("SELECT COUNT(*)::int AS count FROM referrals WHERE LOWER(COALESCE(status, '')) = 'completed'")
        .catch(() => ({ rows: [{ count: 0 }] })),
      client
        .query(
          `SELECT COUNT(*)::int AS count
           FROM individual_treatment_records
           WHERE (COALESCE(diagnosis,'') <> '' OR COALESCE(diagnosis_1,'') <> '' OR COALESCE(diagnosis_2,'') <> '' OR COALESCE(diagnosis_3,'') <> '')`
        )
        .catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    const metrics = {
      totalPatients: patientsRes.rows[0]?.count || 0,
      totalReferrals: referralsRes.rows[0]?.count || 0,
      completedReferrals: completedReferralsRes.rows[0]?.count || 0,
      diagnosedRecords: diagnosesRes.rows[0]?.count || 0,
    };

    // Monthly analytics for the last 6 months including current
    const monthlyQuery = (table, dateCol) => `
      WITH months AS (
        SELECT to_char(date_trunc('month', (CURRENT_DATE - (n || ' months')::interval)), 'YYYY-MM') AS ym,
               date_trunc('month', (CURRENT_DATE - (n || ' months')::interval)) AS start_date,
               (date_trunc('month', (CURRENT_DATE - (n || ' months')::interval)) + interval '1 month') AS end_date
        FROM generate_series(0, 5) AS n
      )
      SELECT m.ym,
             COALESCE(COUNT(t.*), 0)::int AS count
      FROM months m
      LEFT JOIN ${table} t
        ON (t.${dateCol} >= m.start_date AND t.${dateCol} < m.end_date)
      GROUP BY m.ym
      ORDER BY m.ym;
    `;

    const [referralsMonthlyRes, patientsMonthlyRes, diagnosesMonthlyRes] = await Promise.all([
      client.query(monthlyQuery('referrals', 'created_at')).catch(() => ({ rows: [] })),
      client.query("SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS ym, COUNT(*)::int AS count FROM patients WHERE type = 'staff_data' GROUP BY 1 ORDER BY 1").catch(() => ({ rows: [] })),
      client.query(monthlyQuery('individual_treatment_records', 'created_at')).catch(() => ({ rows: [] })),
    ]);

    const labels = Array.from(
      new Set([
        ...referralsMonthlyRes.rows.map(r => r.ym),
        ...patientsMonthlyRes.rows.map(r => r.ym),
        ...diagnosesMonthlyRes.rows.map(r => r.ym),
      ])
    ).sort();

    const toMap = rows => Object.fromEntries(rows.map(r => [r.ym, r.count]));
    const rMap = toMap(referralsMonthlyRes.rows);
    const pMap = toMap(patientsMonthlyRes.rows);
    const dMap = toMap(diagnosesMonthlyRes.rows);

    const analytics = {
      labels,
      referrals: labels.map(l => rMap[l] || 0),
      patients: labels.map(l => pMap[l] || 0),
      diagnoses: labels.map(l => dMap[l] || 0),
    };

    // Fetch common diagnoses by barangay from approved_diagnoses
    const diagnosisByBarangayQuery = `
      SELECT 
        p.residential_address,
        ad.diagnosis_text,
        COUNT(*) as count
      FROM approved_diagnoses ad
      JOIN individual_treatment_records itr ON ad.treatment_record_id = itr.id
      JOIN patients p ON itr.patient_id = p.id
      WHERE ad.diagnosis_text IS NOT NULL 
        AND ad.diagnosis_text != ''
        AND p.residential_address IS NOT NULL
        AND p.residential_address != ''
      GROUP BY p.residential_address, ad.diagnosis_text
      ORDER BY p.residential_address, count DESC
    `;

    const diagnosisByBarangayRes = await client.query(diagnosisByBarangayQuery).catch(() => ({ rows: [] }));

    // Process the data to group by barangay
    const barangayDiagnoses = {};
    const balingasagBarangays = [
      "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
      "Balagnan", "Balingoan", "Barangay", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
      "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
      "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
      "Talusan", "Waterfall"
    ];

    // Initialize all barangays
    balingasagBarangays.forEach(brgy => {
      barangayDiagnoses[brgy] = [];
    });

    // Map diagnoses to barangays
    diagnosisByBarangayRes.rows.forEach(row => {
      const address = row.residential_address || '';
      // Find matching barangay in address
      const matchedBarangay = balingasagBarangays.find(brgy => 
        address.toLowerCase().includes(brgy.toLowerCase())
      );
      
      if (matchedBarangay) {
        barangayDiagnoses[matchedBarangay].push({
          diagnosis: row.diagnosis_text,
          count: parseInt(row.count)
        });
      }
    });

    // Get top 5 diagnoses for each barangay
    const topDiagnosesByBarangay = {};
    Object.keys(barangayDiagnoses).forEach(brgy => {
      topDiagnosesByBarangay[brgy] = barangayDiagnoses[brgy]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    });

    return res.status(200).json({ metrics, analytics, diagnosisByBarangay: topDiagnosesByBarangay });
  } catch (error) {
    console.error('staff_analytics error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    client.release();
  }
}
