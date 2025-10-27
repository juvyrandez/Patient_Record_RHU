import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page = 1, limit = 10, barangay = '', startDate = '', endDate = '' } = req.query;
  const patientOffset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const client = await pool.connect();
    try {
      // Build WHERE clause for filtering
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Add barangay filter
      if (barangay && barangay !== '') {
        whereConditions.push(`residential_address ILIKE $${paramIndex}`);
        queryParams.push(`%${barangay}%`);
        paramIndex++;
      }

      // Add date range filter
      if (startDate && startDate !== '') {
        whereConditions.push(`created_at >= $${paramIndex}::date`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate && endDate !== '') {
        whereConditions.push(`created_at <= $${paramIndex}::date + INTERVAL '1 day'`);
        queryParams.push(endDate);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Fetch Patient Summary with pagination and filters
      const patientsRes = await client.query(`
        SELECT id, first_name, last_name, gender, type, residential_address, created_at
        FROM patients
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...queryParams, parseInt(limit), patientOffset]);

      const totalPatientsRes = await client.query(`
        SELECT COUNT(*) AS total
        FROM patients
        ${whereClause}
      `, queryParams);

      // Helper function to extract barangay from residential address
      const extractBarangay = (address) => {
        if (!address) return 'N/A';
        
        const barangays = [
          "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
          "Balagnan", "Balingoan", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli", "Dumarait",
          "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
          "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
          "Talusan", "Waterfall", "Barangay"
        ];
        
        const addressLower = address.toLowerCase();
        
        for (const brgy of barangays) {
          const brgyLower = brgy.toLowerCase();
          const regex = new RegExp(`\\b${brgyLower.replace(/\s+/g, '\\s+')}\\b`, 'i');
          if (regex.test(addressLower)) {
            return brgy;
          }
        }
        
        for (const brgy of barangays) {
          if (addressLower.includes(brgy.toLowerCase())) {
            return brgy;
          }
        }
        
        return 'N/A';
      };

      const patients = patientsRes.rows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        date: new Date(row.created_at).toLocaleDateString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).split('/').reverse().join('-'),
        gender: row.gender,
        category: row.type === 'staff_data' ? 'Staff' : 'BHW',
        barangay: extractBarangay(row.residential_address),
        address: row.residential_address || 'N/A',
      }));

      const totalPatients = parseInt(totalPatientsRes.rows[0].total);

      const dailyRes = await client.query(`
        SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') AS date,
               COUNT(*) AS count
        FROM patients
        WHERE created_at >= (CURRENT_DATE AT TIME ZONE 'Asia/Manila') - INTERVAL '6 days'
          AND created_at < (CURRENT_DATE AT TIME ZONE 'Asia/Manila') + INTERVAL '1 day'
        GROUP BY DATE(created_at AT TIME ZONE 'Asia/Manila')
        ORDER BY date ASC
      `);

      const dailyLabels = [];
      const dailyData = [];
      
      // Get current date in Manila timezone
      const now = new Date();
      const manilaOffset = 8 * 60; // UTC+8 in minutes
      const manilaTime = new Date(now.getTime() + (manilaOffset + now.getTimezoneOffset()) * 60000);
      
      // Generate last 7 days including today with proper Manila timezone
      for (let i = 6; i >= 0; i--) {
        const date = new Date(manilaTime);
        date.setDate(date.getDate() - i);
        
        // Format date to YYYY-MM-DD for comparison
        const dateKey = date.toISOString().split('T')[0];
        
        // Get weekday name
        const dateStr = date.toLocaleDateString('en-US', { 
          weekday: 'short',
          timeZone: 'UTC' // Use UTC since we already adjusted the date
        });
        
        // Find matching record
        const record = dailyRes.rows.find(row => {
          const rowDate = new Date(row.date);
          const rowDateKey = rowDate.toISOString().split('T')[0];
          return rowDateKey === dateKey;
        });
        
        dailyLabels.push(dateStr);
        dailyData.push(record ? parseInt(record.count) : 0);
      }

      const dailyReportData = {
        labels: dailyLabels,
        datasets: [
          {
            label: 'Patient Registrations',
            data: dailyData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

      // Fetch Monthly Reports for the current year (show all 12 months)
      const currentYear = new Date().getFullYear();
      const monthlyRes = await client.query(`
        SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM') AS month,
               COUNT(*) AS count
        FROM patients
        WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') = $1
        GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM')
        ORDER BY month ASC
      `, [currentYear]);

      // Create a map of month to count for easy lookup
      const monthCountMap = {};
      monthlyRes.rows.forEach(row => {
        const monthKey = row.month.split('-')[1]; // Get just the month part (MM)
        monthCountMap[parseInt(monthKey)] = parseInt(row.count);
      });

      const monthlyLabels = [];
      const monthlyData = [];
      
      // Generate all 12 months with proper labels
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let month = 1; month <= 12; month++) {
        monthlyLabels.push(monthNames[month - 1]);
        monthlyData.push(monthCountMap[month] || 0); // Use 0 if no data for this month
      }

      const monthlyReportData = {
        labels: monthlyLabels,
        datasets: [
          {
            label: 'Patient Registrations',
            data: monthlyData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

      // Fetch Yearly Reports (all years from 2020 to current year)
      const startYear = 2020;
      const currentYearValue = new Date().getFullYear();
      
      // Get counts for all years from 2020 to current year
      const yearlyRes = await client.query(`
        SELECT EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') AS year,
               COUNT(*) AS count
        FROM patients
        WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') BETWEEN $1 AND $2
        GROUP BY EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila')
        ORDER BY year ASC
      `, [startYear, currentYearValue]);

      // Create arrays for all years from 2020 to current year
      const yearlyLabels = [];
      const yearlyData = [];
      
      for (let year = startYear; year <= currentYearValue; year++) {
        const yearStr = year.toString();
        const record = yearlyRes.rows.find(row => row.year.toString() === yearStr);
        
        yearlyLabels.push(yearStr);
        yearlyData.push(record ? parseInt(record.count) : 0);
      }

      const yearlyReportData = {
        labels: yearlyLabels,
        datasets: [
          {
            label: 'Patient Registrations',
            data: yearlyData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

      res.status(200).json({
        patientSummary: { patients, total: totalPatients },
        dailyReportData,
        monthlyReportData,
        yearlyReportData,
      });
    } catch (error) {
      console.error('Error executing queries:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
      });
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error connecting to database:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ message: 'Database Connection Error', error: error.message });
  }
}