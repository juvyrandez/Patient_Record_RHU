import pool from "@/lib/db";

export default async function handler(req, res) {
  // Handle read: list treatment records
  if (req.method === "GET") {
    const client = await pool.connect();
    try {
      const { limit = 50, patient_id, id, status, data_type, bhw_id } = req.query;
      const lim = Math.min(parseInt(limit, 10) || 50, 200);
      const where = [];
      const params = [];
      if (id) { params.push(parseInt(id, 10)); where.push(`id = $${params.length}`); }
      if (patient_id) { params.push(parseInt(patient_id, 10)); where.push(`patient_id = $${params.length}`); }
      if (data_type) { params.push(data_type); where.push(`data_type = $${params.length}`); }
      if (bhw_id) { params.push(parseInt(bhw_id, 10)); where.push(`bhw_id = $${params.length}`); }
      if (status === 'pending') {
        // Pending: allow suggested diagnoses to exist; consider pending until any treatment/lab fields are filled
        where.push(`COALESCE(medication,'') = '' AND COALESCE(lab_findings,'') = '' AND COALESCE(lab_tests,'') = ''`);
      } else if (status === 'completed') {
        // Completed: any treatment/lab fields provided
        where.push(`(COALESCE(medication,'') <> '' OR COALESCE(lab_findings,'') <> '' OR COALESCE(lab_tests,'') <> '')`);
      }

      params.push(lim);

      const sql = `
        SELECT id,
               patient_id,
               patient_first_name,
               patient_last_name,
               patient_middle_name,
               patient_suffix,
               patient_birth_date,
               visit_type,
               consultation_date,
               consultation_period,
               consultation_time,
               attending_provider,
               referred_from,
               referred_to,
               referred_by,
               referral_reasons,
               blood_pressure,
               temperature,
               height_cm,
               weight_kg,
               heart_rate,
               respiratory_rate,
               purpose_of_visit,
               chief_complaints,
               diagnosis,
               diagnosis_1,
               diagnosis_2,
               diagnosis_3,
               medication,
               lab_findings,
               lab_tests,
               status,
               data_type,
               bhw_id,
               created_at
        FROM individual_treatment_records
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY created_at DESC
        LIMIT $${params.length}`;
      const { rows } = await client.query(sql, params);
      return res.status(200).json(rows);
    } catch (err) {
      console.error("/api/treatment_records GET error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }

  if (req.method !== "POST") {
    // Allow PUT to update diagnoses from the doctor dashboard
    if (req.method === "PUT") {
      const client = await pool.connect();
      try {
        const { id } = req.query;
        const { diagnosis = null, diagnosis_1 = null, diagnosis_2 = null, diagnosis_3 = null, medication = null, lab_findings = null, lab_tests = null, status = null } = req.body || {};
        
        if (!id) return res.status(400).json({ error: "Missing id" });
        
        // Build dynamic update query based on provided fields
        const updates = [];
        const values = [parseInt(id, 10)];
        let paramCount = 1;
        
        if (diagnosis !== null) { paramCount++; updates.push(`diagnosis = $${paramCount}`); values.push(diagnosis); }
        if (diagnosis_1 !== null) { paramCount++; updates.push(`diagnosis_1 = $${paramCount}`); values.push(diagnosis_1); }
        if (diagnosis_2 !== null) { paramCount++; updates.push(`diagnosis_2 = $${paramCount}`); values.push(diagnosis_2); }
        if (diagnosis_3 !== null) { paramCount++; updates.push(`diagnosis_3 = $${paramCount}`); values.push(diagnosis_3); }
        if (medication !== null) { paramCount++; updates.push(`medication = $${paramCount}`); values.push(medication); }
        if (lab_findings !== null) { paramCount++; updates.push(`lab_findings = $${paramCount}`); values.push(lab_findings); }
        if (lab_tests !== null) { paramCount++; updates.push(`lab_tests = $${paramCount}`); values.push(lab_tests); }
        if (status !== null) { paramCount++; updates.push(`status = $${paramCount}`); values.push(status); }
        
        if (updates.length === 0) {
          return res.status(400).json({ error: "No fields to update" });
        }
        
        updates.push('updated_at = NOW()');
        
        const sql = `
          UPDATE individual_treatment_records
          SET ${updates.join(', ')}
          WHERE id = $1
          RETURNING *`;
          
        const { rows } = await client.query(sql, values);
        if (!rows.length) return res.status(404).json({ error: "Record not found" });
        return res.status(200).json(rows[0]);
      } catch (err) {
        console.error("/api/treatment_records PUT error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      } finally {
        client.release();
      }
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const client = await pool.connect();
  try {
    const {
      // Patient identity (from UI)
      patient = {},
      // Optional referral info (for provenance)
      referral = {},
      // Treatment form payload
      record = {},
    } = req.body || {};

    // Patient identity and validation
    const lastName = (patient.last_name || patient.lastName || "").trim();
    const firstName = (patient.first_name || patient.firstName || "").trim();
    const middleName = (patient.middle_name || patient.middleName || null);
    const suffix = (patient.suffix || null);
    const birthDate = patient.birth_date || patient.birthDate || null;

    await client.query("BEGIN");

    // Resolve patient_id: accept direct IDs from payload first, else fallback lookup
    let patientId = patient.patient_id || patient.patientId || patient.id || record.patient_id || null;
    if (!patientId) {
      // If ID not provided, require minimal name fields for lookup
      if (!lastName || !firstName) {
        return res.status(400).json({ error: "Missing patient_id or patient name for lookup" });
      }
      const params = [lastName, firstName];
      let where = "last_name = $1 AND first_name = $2";
      if (birthDate) {
        where += " AND birth_date = $3";
        params.push(birthDate);
      }
      const findSql = `
        SELECT id FROM patients
        WHERE ${where}
        ORDER BY (CASE WHEN type = 'staff_data' THEN 0 ELSE 1 END), id ASC
        LIMIT 1`;
      const { rows } = await client.query(findSql, params);
      if (rows.length) patientId = rows[0].id;
    }
    if (!patientId) {
      return res.status(400).json({ error: "Unable to resolve patient_id" });
    }

    // Prepare insert into individual_treatment_records
    const {
      visit_type,
      consultation_date,
      consultation_period,
      consultation_time,
      blood_pressure,
      temperature,
      height_cm,
      weight_kg,
      heart_rate,
      respiratory_rate,
      attending_provider,
      referred_from,
      referred_to,
      referral_reasons, // comma-separated string or array
      referred_by,
      purpose_of_visit,
      chief_complaints,
      diagnosis,
      diagnosis_1,
      diagnosis_2,
      diagnosis_3,
      medication,
      lab_findings,
      lab_tests,
    } = record || {};

    const reasonsArray = Array.isArray(referral_reasons)
      ? referral_reasons
      : (typeof referral_reasons === "string" && referral_reasons.trim())
        ? referral_reasons.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const insertSql = `
      INSERT INTO individual_treatment_records (
        patient_id,
        patient_last_name, patient_first_name, patient_middle_name, patient_suffix, patient_birth_date,
        visit_type, consultation_date, consultation_period, consultation_time,
        blood_pressure, temperature, height_cm, weight_kg, heart_rate, respiratory_rate,
        attending_provider,
        referred_from, referred_to, referral_reasons, referred_by,
        purpose_of_visit,
        chief_complaints, diagnosis, diagnosis_1, diagnosis_2, diagnosis_3, medication, lab_findings, lab_tests,
        referral_id, status, data_type, bhw_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16,
        $17,
        $18, $19, $20, $21,
        $22,
        $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34
      ) RETURNING *`;

    const values = [
      patientId,
      lastName, firstName, middleName, suffix, birthDate,
      visit_type || null,
      consultation_date || null,
      consultation_period || null,
      consultation_time || null,
      blood_pressure || null,
      temperature || null,
      height_cm || null,
      weight_kg || null,
      heart_rate || null,
      respiratory_rate || null,
      attending_provider || null,
      referred_from || null,
      referred_to || null,
      reasonsArray.length ? reasonsArray : null,
      referred_by || null,
      purpose_of_visit || null,
      chief_complaints || null,
      diagnosis || null,
      diagnosis_1 || null,
      diagnosis_2 || null,
      diagnosis_3 || null,
      medication || null,
      lab_findings || null,
      lab_tests || null,
      referral?.id || null,
      record.status || 'pending',
      record.data_type || null,
      record.bhw_id || null,
    ];

    const result = await client.query(insertSql, values);
    await client.query("COMMIT");
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("/api/treatment_records error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
}
