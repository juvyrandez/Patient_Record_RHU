import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { referral_id } = req.query;

  if (!referral_id) {
    return res.status(400).json({ error: 'Referral ID is required' });
  }

  try {
    // Get the treatment record associated with this referral
    const treatmentRecordQuery = `
      SELECT id, status
      FROM individual_treatment_records
      WHERE referral_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const treatmentResult = await pool.query(treatmentRecordQuery, [referral_id]);
    
    if (treatmentResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No treatment record found for this referral',
        consultation_status: null
      });
    }

    const treatmentRecord = treatmentResult.rows[0];
    
    // Get the consultation decision for this treatment record
    const consultationQuery = `
      SELECT status
      FROM consultation_decisions
      WHERE treatment_record_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const consultationResult = await pool.query(consultationQuery, [treatmentRecord.id]);
    
    if (consultationResult.rows.length === 0) {
      // No consultation decision yet, return treatment record status
      return res.status(200).json({
        consultation_status: treatmentRecord.status || 'Pending',
        source: 'treatment_record'
      });
    }

    // Return the consultation decision status
    const consultationDecision = consultationResult.rows[0];
    return res.status(200).json({
      consultation_status: consultationDecision.status || 'Pending',
      source: 'consultation_decision'
    });

  } catch (error) {
    console.error('Error fetching referral consultation status:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch consultation status',
      message: error.message 
    });
  }
}
