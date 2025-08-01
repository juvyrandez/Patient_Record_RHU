import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get single patient
          const { rows } = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
          if (rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
          }
          res.status(200).json(rows[0]);
        } else {
          // Get all patients
          const { rows } = await pool.query('SELECT * FROM patients ORDER BY last_name, first_name');
          res.status(200).json(rows);
        }
        break;

      case 'POST':
        // Create new patient
        const {
          last_name,
          first_name,
          middle_name,
          maiden_name,
          suffix,
          gender,
          birth_date,
          birth_place,
          blood_type,
          civil_status,
          spouse_name,
          educational_attainment,
          employment_status,
          family_member_role,
          residential_address,
          contact_number,
          mothers_name,
          dswd_nhts,
          facility_household_no,
          pps_member,
          pps_household_no,
          philhealth_member,
          philhealth_status,
          philhealth_number,
          philhealth_category,
          pcb_member,
          status
        } = req.body;

        const { rows: [newPatient] } = await pool.query(
          `INSERT INTO patients (
            last_name, first_name, middle_name, maiden_name, suffix, gender,
            birth_date, birth_place, blood_type, civil_status, spouse_name,
            educational_attainment, employment_status, family_member_role,
            residential_address, contact_number, mothers_name, dswd_nhts,
            facility_household_no, pps_member, pps_household_no,
            philhealth_member, philhealth_status, philhealth_number,
            philhealth_category, pcb_member, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
          ) RETURNING *`,
          [
            last_name,
            first_name,
            middle_name,
            maiden_name,
            suffix,
            gender,
            birth_date,
            birth_place,
            blood_type,
            civil_status,
            spouse_name,
            educational_attainment,
            employment_status,
            family_member_role,
            residential_address,
            contact_number,
            mothers_name,
            dswd_nhts,
            facility_household_no,
            pps_member,
            pps_household_no,
            philhealth_member,
            philhealth_status,
            philhealth_number,
            philhealth_category,
            pcb_member,
            status
          ]
        );
        res.status(201).json(newPatient);
        break;

      case 'PUT':
        // Update patient
        const {
          last_name: update_last_name,
          first_name: update_first_name,
          middle_name: update_middle_name,
          maiden_name: update_maiden_name,
          suffix: update_suffix,
          gender: update_gender,
          birth_date: update_birth_date,
          birth_place: update_birth_place,
          blood_type: update_blood_type,
          civil_status: update_civil_status,
          spouse_name: update_spouse_name,
          educational_attainment: update_educational_attainment,
          employment_status: update_employment_status,
          family_member_role: update_family_member_role,
          residential_address: update_residential_address,
          contact_number: update_contact_number,
          mothers_name: update_mothers_name,
          dswd_nhts: update_dswd_nhts,
          facility_household_no: update_facility_household_no,
          pps_member: update_pps_member,
          pps_household_no: update_pps_household_no,
          philhealth_member: update_philhealth_member,
          philhealth_status: update_philhealth_status,
          philhealth_number: update_philhealth_number,
          philhealth_category: update_philhealth_category,
          pcb_member: update_pcb_member,
          status: update_status
        } = req.body;

        const { rows: [updatedPatient] } = await pool.query(
          `UPDATE patients SET
            last_name = $1,
            first_name = $2,
            middle_name = $3,
            maiden_name = $4,
            suffix = $5,
            gender = $6,
            birth_date = $7,
            birth_place = $8,
            blood_type = $9,
            civil_status = $10,
            spouse_name = $11,
            educational_attainment = $12,
            employment_status = $13,
            family_member_role = $14,
            residential_address = $15,
            contact_number = $16,
            mothers_name = $17,
            dswd_nhts = $18,
            facility_household_no = $19,
            pps_member = $20,
            pps_household_no = $21,
            philhealth_member = $22,
            philhealth_status = $23,
            philhealth_number = $24,
            philhealth_category = $25,
            pcb_member = $26,
            status = $27,
            updated_at = NOW()
          WHERE id = $28
          RETURNING *`,
          [
            update_last_name,
            update_first_name,
            update_middle_name,
            update_maiden_name,
            update_suffix,
            update_gender,
            update_birth_date,
            update_birth_place,
            update_blood_type,
            update_civil_status,
            update_spouse_name,
            update_educational_attainment,
            update_employment_status,
            update_family_member_role,
            update_residential_address,
            update_contact_number,
            update_mothers_name,
            update_dswd_nhts,
            update_facility_household_no,
            update_pps_member,
            update_pps_household_no,
            update_philhealth_member,
            update_philhealth_status,
            update_philhealth_number,
            update_philhealth_category,
            update_pcb_member,
            update_status,
            id
          ]
        );
        res.status(200).json(updatedPatient);
        break;

      case 'DELETE':
        // Delete patient
        const { rowCount } = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
        if (rowCount === 0) {
          return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient deleted successfully' });
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