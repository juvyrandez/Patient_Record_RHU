import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single referral
          const { rows } = await pool.query(
            'SELECT * FROM referrals WHERE id = $1',
            [id]
          );
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Referral not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all referrals with patient info
          const { rows } = await pool.query(`
            SELECT r.*, 
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   p.middle_name as patient_middle_name
            FROM referrals r
            JOIN patients p ON r.patient_id = p.id
            ORDER BY r.referral_date DESC, r.referral_time DESC
          `);
          res.status(200).json(rows);
        }
        break;

      case 'POST':
        // Create new referral
        const {
          patientId,
          referralType,
          date,
          time,
          referredTo,
          referredToAddress,
          patientLastName,
          patientFirstName,
          patientMiddleName,
          patientAddress,
          chiefComplaints,
          medicalHistory,
          surgicalOperations,
          surgicalProcedure,
          drugAllergy,
          allergyType,
          lastMealTime,
          bloodPressure,
          heartRate,
          respiratoryRate,
          weight,
          impression,
          actionTaken,
          healthInsurance,
          insuranceType,
          referralReason,
          otherReason,
          referredByName,
          licenseNumber
        } = req.body;

        // Validate required fields
        if (!patientId || !referralType || !date || !time || !referredTo || 
            !referredToAddress || !patientLastName || !patientFirstName || 
            !patientAddress || !chiefComplaints || !referredByName || 
            !licenseNumber) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify patient exists in bhw_patients
        const { rows: patientCheck } = await pool.query(
          'SELECT id FROM patients WHERE id = $1',
          [patientId]
        );
        if (patientCheck.length === 0) {
          return res.status(404).json({ message: 'Patient not found in patients' });
        }

        // Insert referral
        const { rows: [newReferral] } = await pool.query(
          `INSERT INTO referrals (
            patient_id, referral_type, referral_date, referral_time,
            referred_to, referred_to_address, patient_last_name,
            patient_first_name, patient_middle_name, patient_address,
            chief_complaints, medical_history, surgical_operations,
            surgical_procedure, drug_allergy, allergy_type, last_meal_time,
            blood_pressure, heart_rate, respiratory_rate, weight,
            impression, action_taken, health_insurance, insurance_type,
            referral_reasons, other_reason, referred_by_name, license_number
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29
          ) RETURNING *`,
          [
            patientId,
            referralType,
            date,
            time,
            referredTo,
            referredToAddress,
            patientLastName,
            patientFirstName,
            patientMiddleName,
            patientAddress,
            chiefComplaints,
            medicalHistory,
            surgicalOperations,
            surgicalProcedure,
            drugAllergy,
            allergyType,
            lastMealTime,
            bloodPressure,
            heartRate,
            respiratoryRate,
            weight,
            impression,
            actionTaken,
            healthInsurance,
            insuranceType,
            referralReason,
            otherReason,
            referredByName,
            licenseNumber
          ]
        );

        // Insert notification for the new referral
        await pool.query(
          `INSERT INTO notifications (referral_id, message, type, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [
            newReferral.id,
            `New referral created for ${patientFirstName} ${patientLastName} to ${referredTo}`,
            'referral'
          ]
        );

        res.status(201).json(newReferral);
        break;

      case 'PUT':
        // Update referral
        const {
          referralType: updateReferralType,
          date: updateDate,
          time: updateTime,
          referredTo: updateReferredTo,
          referredToAddress: updateReferredToAddress,
          patientLastName: updatePatientLastName,
          patientFirstName: updatePatientFirstName,
          patientMiddleName: updatePatientMiddleName,
          patientAddress: updatePatientAddress,
          chiefComplaints: updateChiefComplaints,
          medicalHistory: updateMedicalHistory,
          surgicalOperations: updateSurgicalOperations,
          surgicalProcedure: updateSurgicalProcedure,
          drugAllergy: updateDrugAllergy,
          allergyType: updateAllergyType,
          lastMealTime: updateLastMealTime,
          blood_pressure: updateBloodPressure,
          heartRate: updateHeartRate,
          respiratoryRate: updateRespiratoryRate,
          weight: updateWeight,
          impression: updateImpression,
          actionTaken: updateActionTaken,
          healthInsurance: updateHealthInsurance,
          insuranceType: updateInsuranceType,
          referralReason: updateReferralReason,
          otherReason: updateOtherReason,
          referredByName: updateReferredByName,
          licenseNumber: updateLicenseNumber
        } = req.body;

        const { rows: [updatedReferral] } = await pool.query(
          `UPDATE referrals SET
            referral_type = $1,
            referral_date = $2,
            referral_time = $3,
            referred_to = $4,
            referred_to_address = $5,
            patient_last_name = $6,
            patient_first_name = $7,
            patient_middle_name = $8,
            patient_address = $9,
            chief_complaints = $10,
            medical_history = $11,
            surgical_operations = $12,
            surgical_procedure = $13,
            drug_allergy = $14,
            allergy_type = $15,
            last_meal_time = $16,
            blood_pressure = $17,
            heart_rate = $18,
            respiratory_rate = $19,
            weight = $20,
            impression = $21,
            action_taken = $22,
            health_insurance = $23,
            insurance_type = $24,
            referral_reasons = $25,
            other_reason = $26,
            referred_by_name = $27,
            license_number = $28,
            updated_at = NOW()
          WHERE id = $29
          RETURNING *`,
          [
            updateReferralType,
            updateDate,
            updateTime,
            updateReferredTo,
            updateReferredToAddress,
            updatePatientLastName,
            updatePatientFirstName,
            updatePatientMiddleName,
            updatePatientAddress,
            updateChiefComplaints,
            updateMedicalHistory,
            updateSurgicalOperations,
            updateSurgicalProcedure,
            updateDrugAllergy,
            updateAllergyType,
            updateLastMealTime,
            updateBloodPressure,
            updateHeartRate,
            updateRespiratoryRate,
            updateWeight,
            updateImpression,
            updateActionTaken,
            updateHealthInsurance,
            updateInsuranceType,
            updateReferralReason,
            updateOtherReason,
            updateReferredByName,
            updateLicenseNumber,
            id
          ]
        );

        if (!updatedReferral) {
          return res.status(404).json({ message: 'Referral not found' });
        }

        res.status(200).json(updatedReferral);
        break;

      case 'DELETE':
        // Delete referral
        const { rowCount } = await pool.query(
          'DELETE FROM referrals WHERE id = $1',
          [id]
        );

        if (rowCount === 0) {
          return res.status(404).json({ message: 'Referral not found' });
        }

        res.status(200).json({ message: 'Referral deleted successfully' });
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