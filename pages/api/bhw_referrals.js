import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const query = `
      SELECT 
        id,
        patient_id,
        referral_type,
        referral_date,
        referral_time,
        referred_to,
        referred_to_address,
        patient_last_name,
        patient_first_name,
        patient_middle_name,
        patient_address,
        chief_complaints,
        medical_history,
        surgical_operations,
        surgical_procedure,
        drug_allergy,
        allergy_type,
        last_meal_time,
        blood_pressure,
        heart_rate,
        respiratory_rate,
        weight,
        impression,
        action_taken,
        health_insurance,
        insurance_type,
        referral_reasons,
        other_reason,
        referred_by_name,
        license_number,
        status,
        seen,
        created_at,
        updated_at
      FROM referrals 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}