import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query to get approved diagnosis counts by barangay and gender
    const query = `
      SELECT 
        p.residential_address,
        p.gender,
        ad.diagnosis_text
      FROM approved_diagnoses ad
      INNER JOIN individual_treatment_records itr ON ad.treatment_record_id = itr.id
      INNER JOIN patients p ON itr.patient_id = p.id
      WHERE p.residential_address IS NOT NULL
        AND p.gender IS NOT NULL
        AND ad.diagnosis_text IS NOT NULL
        AND ad.diagnosis_text != ''
    `;

    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} approved diagnoses records`);
    
    // Process the data to aggregate by disease and barangay
    const diseaseMap = {};
    let processedCount = 0;
    let skippedCount = 0;
    
    // Helper function to extract barangay from residential address
    const extractBarangay = (address) => {
      if (!address) return null;
      
      // List of barangays to match (order matters - check specific ones first)
      const barangays = [
        "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
        "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor", // Check "San X" before other names
        "Balagnan", "Balingoan", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
        "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
        "Natubo", "Quezon", "Talusan", "Waterfall", "Barangay"
      ];
      
      const addressLower = address.toLowerCase();
      
      // Try to find barangay name with word boundaries
      for (const brgy of barangays) {
        const brgyLower = brgy.toLowerCase();
        // Check if barangay name appears as a word (with spaces or punctuation around it)
        const regex = new RegExp(`\\b${brgyLower.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regex.test(addressLower)) {
          return brgy;
        }
      }
      
      // Fallback to simple includes check
      for (const brgy of barangays) {
        if (addressLower.includes(brgy.toLowerCase())) {
          return brgy;
        }
      }
      
      return null;
    };
    
    result.rows.forEach(row => {
      const barangay = extractBarangay(row.residential_address);
      const gender = row.gender;
      const diagnosis = row.diagnosis_text;
      
      if (diagnosis && diagnosis.trim() && barangay) {
        processedCount++;
        
        // Remove confidence percentage if present (e.g., "Hypertension (85.5%)" -> "Hypertension")
        const cleanDiagnosis = diagnosis.replace(/\s*\([0-9.]+%\)\s*$/, '').trim();
        
        if (!diseaseMap[cleanDiagnosis]) {
          diseaseMap[cleanDiagnosis] = {};
        }
        
        if (!diseaseMap[cleanDiagnosis][barangay]) {
          diseaseMap[cleanDiagnosis][barangay] = { M: 0, F: 0, T: 0 };
        }
        
        // Increment counts based on gender
        if (gender === 'Male' || gender === 'M') {
          diseaseMap[cleanDiagnosis][barangay].M += 1;
          diseaseMap[cleanDiagnosis][barangay].T += 1;
        } else if (gender === 'Female' || gender === 'F') {
          diseaseMap[cleanDiagnosis][barangay].F += 1;
          diseaseMap[cleanDiagnosis][barangay].T += 1;
        }
      } else {
        skippedCount++;
        if (!barangay) {
          console.log(`Skipped - No barangay found in address: ${row.residential_address}`);
        }
      }
    });
    
    console.log(`Processed: ${processedCount}, Skipped: ${skippedCount}`);
    
    // Convert to array format
    const diseases = Object.keys(diseaseMap).sort().map((disease, index) => ({
      id: index + 1,
      disease: disease,
      brgys: diseaseMap[disease]
    }));
    
    res.status(200).json({ diseases });
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({ error: 'Failed to fetch health summary data' });
  }
}
