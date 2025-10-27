import pool from '@/lib/db';

// Helper function to convert empty strings to null for numeric fields
const toNumericOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single PHILPEN record
          const { rows } = await pool.query(
            'SELECT * FROM philpen_records WHERE id = $1',
            [id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ message: 'PHILPEN record not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all PHILPEN records with patient info
          const { rows } = await pool.query(`
            SELECT pr.*, 
                   p.first_name, p.last_name, p.middle_name,
                   p.residential_address, p.contact_number
            FROM philpen_records pr
            LEFT JOIN patients p ON pr.patient_id = p.id
            ORDER BY pr.assessment_date DESC, pr.created_at DESC
          `);
          res.status(200).json(rows);
        }
        break;

      case 'POST':
        // Create new PHILPEN record
        const {
          patient_id,
          health_facility,
          assessment_date,
          patient_name,
          age,
          sex,
          birthdate,
          civil_status,
          contact_no,
          patient_address,
          employment_status,
          ethnicity,
          red_flags,
          past_medical_history,
          family_history,
          tobacco_use,
          tobacco_cessation_advice,
          alcohol_intake,
          alcohol_screening_advice,
          physical_activity_hours,
          physical_activity_advice,
          nutrition_assessment,
          nutrition_advice,
          weight_kg,
          height_cm,
          bmi,
          waist_circumference_cm,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          fbs_result,
          fbs_date,
          rbs_result,
          rbs_date,
          lipid_profile,
          lipid_profile_date,
          urinalysis_protein,
          urinalysis_ketones,
          urinalysis_date,
          respiratory_symptoms,
          respiratory_screening_advice,
          lifestyle_modification,
          medications,
          date_of_followup,
          remarks,
          risk_level,
          recommendations,
          referral_needed,
          referral_facility,
          created_by
        } = req.body;

        // Validate required fields
        if (!assessment_date || !patient_name) {
          return res.status(400).json({ message: 'Assessment date and patient name are required' });
        }

        // Convert numeric fields to proper format (null if empty)
        const numericAge = toNumericOrNull(age);
        const numericWeight = toNumericOrNull(weight_kg);
        const numericHeight = toNumericOrNull(height_cm);
        const numericWaist = toNumericOrNull(waist_circumference_cm);
        const numericBPSystolic = toNumericOrNull(blood_pressure_systolic);
        const numericBPDiastolic = toNumericOrNull(blood_pressure_diastolic);

        // Calculate BMI if weight and height are provided
        let calculatedBMI = toNumericOrNull(bmi);
        if (numericWeight && numericHeight && !calculatedBMI) {
          const heightInMeters = numericHeight / 100;
          calculatedBMI = (numericWeight / (heightInMeters * heightInMeters)).toFixed(2);
        }

        // Determine risk level based on red flags and measurements
        let assessedRiskLevel = risk_level;
        if (!assessedRiskLevel) {
          // Auto-assess risk level based on red flags and vital signs
          const hasRedFlags = red_flags && Object.values(red_flags).some(flag => flag === true);
          const highBP = numericBPSystolic > 140 || numericBPDiastolic > 90;
          const highBMI = calculatedBMI > 30;
          
          if (hasRedFlags) {
            assessedRiskLevel = 'High';
          } else if (highBP || highBMI) {
            assessedRiskLevel = 'Moderate';
          } else {
            assessedRiskLevel = 'Low';
          }
        }

        // Insert PHILPEN record
        const { rows: [newRecord] } = await pool.query(
          `INSERT INTO philpen_records (
            patient_id, health_facility, assessment_date, patient_name, age, sex, birthdate,
            civil_status, contact_no, patient_address, employment_status, ethnicity,
            red_flags, past_medical_history, family_history, 
            tobacco_use, tobacco_cessation_advice, alcohol_intake, alcohol_screening_advice,
            physical_activity_hours, physical_activity_advice, nutrition_assessment, nutrition_advice,
            weight_kg, height_cm, bmi, waist_circumference_cm,
            blood_pressure_systolic, blood_pressure_diastolic,
            fbs_result, fbs_date, rbs_result, rbs_date, lipid_profile, lipid_profile_date,
            urinalysis_protein, urinalysis_ketones, urinalysis_date,
            respiratory_symptoms, respiratory_screening_advice,
            lifestyle_modification, medications, date_of_followup, remarks,
            risk_level, recommendations, referral_needed, referral_facility, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35,
            $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49
          ) RETURNING *`,
          [
            patient_id, health_facility || 'RHU BALINGASAG', assessment_date, patient_name,
            numericAge, sex, birthdate, civil_status, contact_no, patient_address, employment_status,
            ethnicity, JSON.stringify(red_flags || {}), JSON.stringify(past_medical_history || {}),
            JSON.stringify(family_history || {}), JSON.stringify(tobacco_use || {}), tobacco_cessation_advice,
            JSON.stringify(alcohol_intake || {}), alcohol_screening_advice, physical_activity_hours || null,
            physical_activity_advice, JSON.stringify(nutrition_assessment || {}), nutrition_advice,
            numericWeight, numericHeight, calculatedBMI, numericWaist,
            numericBPSystolic, numericBPDiastolic, fbs_result || null, fbs_date || null,
            rbs_result || null, rbs_date || null, JSON.stringify(lipid_profile || {}), lipid_profile_date || null,
            urinalysis_protein || null, urinalysis_ketones || null, urinalysis_date || null,
            JSON.stringify(respiratory_symptoms || {}), respiratory_screening_advice,
            lifestyle_modification, JSON.stringify(medications || {}), date_of_followup || null, remarks,
            assessedRiskLevel, recommendations, referral_needed, referral_facility, created_by
          ]
        );

        res.status(201).json(newRecord);
        break;

      case 'PUT':
        // Update PHILPEN record
        if (!id) {
          return res.status(400).json({ message: 'Record ID is required for update' });
        }

        const updateFields = req.body;
        
        // Calculate BMI if weight and height are provided
        if (updateFields.weight_kg && updateFields.height_cm && !updateFields.bmi) {
          const heightInMeters = updateFields.height_cm / 100;
          updateFields.bmi = (updateFields.weight_kg / (heightInMeters * heightInMeters)).toFixed(2);
        }

        // Build dynamic update query
        const updateKeys = Object.keys(updateFields).filter(key => key !== 'id');
        const updateValues = updateKeys.map(key => {
          // Convert objects to JSON strings for JSONB fields
          if (typeof updateFields[key] === 'object' && updateFields[key] !== null) {
            return JSON.stringify(updateFields[key]);
          }
          return updateFields[key];
        });
        
        const setClause = updateKeys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        
        const { rows: [updatedRecord] } = await pool.query(
          `UPDATE philpen_records SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 RETURNING *`,
          [id, ...updateValues]
        );

        if (!updatedRecord) {
          return res.status(404).json({ message: 'PHILPEN record not found' });
        }

        res.status(200).json(updatedRecord);
        break;

      case 'DELETE':
        // Delete PHILPEN record
        const { rowCount } = await pool.query(
          'DELETE FROM philpen_records WHERE id = $1',
          [id]
        );

        if (rowCount === 0) {
          return res.status(404).json({ message: 'PHILPEN record not found' });
        }

        res.status(200).json({ message: 'PHILPEN record deleted successfully' });
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
