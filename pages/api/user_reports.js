import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page = 1, limit = 10, userType = '', startDate = '', endDate = '' } = req.query;
  const userOffset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const client = await pool.connect();
    try {
      // Build WHERE clause for filtering
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

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

      // Fetch all users from different tables
      let usersQuery = '';
      let totalUsersQuery = '';

      if (userType === '' || userType === 'All') {
        // Combine all user types - Note: users table doesn't have created_at column
        // Build separate where clauses for tables with created_at
        const doctorWhereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const bhwWhereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        usersQuery = `
          (SELECT id, fullname, username, email, 'Staff' as user_type, '' as specialization, '' as barangay, '' as contact_number, CURRENT_TIMESTAMP as created_at FROM users)
          UNION ALL
          (SELECT id, fullname, username, email, 'Doctor' as user_type, specialization, '' as barangay, '' as contact_number, created_at FROM doctors ${doctorWhereClause})
          UNION ALL
          (SELECT id, fullname, username, email, 'BHW' as user_type, '' as specialization, barangay, contact_number, created_at FROM bhws ${bhwWhereClause})
          ORDER BY created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        totalUsersQuery = `
          SELECT COUNT(*) as total FROM (
            (SELECT id FROM users)
            UNION ALL
            (SELECT id FROM doctors ${doctorWhereClause})
            UNION ALL
            (SELECT id FROM bhws ${bhwWhereClause})
          ) as all_users
        `;
      } else {
        // Filter by specific user type
        let tableName = '';
        let selectFields = '';
        
        switch (userType) {
          case 'Staff':
            tableName = 'users';
            selectFields = `id, fullname, username, email, 'Staff' as user_type, '' as specialization, '' as barangay, '' as contact_number, CURRENT_TIMESTAMP as created_at`;
            // Users table doesn't have created_at, so we can't filter by date for staff
            usersQuery = `
              SELECT ${selectFields}
              FROM ${tableName}
              ORDER BY id DESC
              LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            totalUsersQuery = `
              SELECT COUNT(*) AS total
              FROM ${tableName}
            `;
            break;
          case 'Doctor':
            tableName = 'doctors';
            selectFields = `id, fullname, username, email, 'Doctor' as user_type, specialization, '' as barangay, '' as contact_number, created_at`;
            usersQuery = `
              SELECT ${selectFields}
              FROM ${tableName}
              ${whereClause}
              ORDER BY created_at DESC
              LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            totalUsersQuery = `
              SELECT COUNT(*) AS total
              FROM ${tableName}
              ${whereClause}
            `;
            break;
          case 'BHW':
            tableName = 'bhws';
            selectFields = `id, fullname, username, email, 'BHW' as user_type, '' as specialization, barangay, contact_number, created_at`;
            usersQuery = `
              SELECT ${selectFields}
              FROM ${tableName}
              ${whereClause}
              ORDER BY created_at DESC
              LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            totalUsersQuery = `
              SELECT COUNT(*) AS total
              FROM ${tableName}
              ${whereClause}
            `;
            break;
          default:
            return res.status(400).json({ message: 'Invalid user type' });
        }
      }

      // Handle query parameters based on user type
      let usersQueryParams, totalUsersQueryParams;
      
      if (userType === 'Staff') {
        // Staff queries don't use date filters since users table has no created_at
        usersQueryParams = [parseInt(limit), userOffset];
        totalUsersQueryParams = [];
      } else if (userType === '' || userType === 'All') {
        // Combined queries use date filters for doctors and bhws tables only
        // We need to pass the date parameters twice (once for doctors, once for bhws)
        const doubleQueryParams = [...queryParams, ...queryParams];
        usersQueryParams = [...doubleQueryParams, parseInt(limit), userOffset];
        totalUsersQueryParams = doubleQueryParams;
      } else {
        // Other individual user types can use date filters
        usersQueryParams = [...queryParams, parseInt(limit), userOffset];
        totalUsersQueryParams = queryParams;
      }

      const usersRes = await client.query(usersQuery, usersQueryParams);
      const totalUsersRes = await client.query(totalUsersQuery, totalUsersQueryParams);

      const users = usersRes.rows.map(row => ({
        id: row.id,
        name: row.fullname,
        username: row.username,
        email: row.email,
        userType: row.user_type,
        specialization: row.specialization || 'N/A',
        barangay: row.barangay || 'N/A',
        contactNumber: row.contact_number || 'N/A',
        date: new Date(row.created_at).toLocaleDateString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).split('/').reverse().join('-'),
      }));

      const totalUsers = parseInt(totalUsersRes.rows[0].total);

      // Daily Reports - User registrations in the last 7 days
      // Note: Staff users don't have created_at, so we get total staff count and distribute it
      const [dailyRes, staffCountRes] = await Promise.all([
        client.query(`
          SELECT date, SUM(count) as count FROM (
            (SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') AS date, COUNT(*) AS count
             FROM doctors
             WHERE created_at >= (CURRENT_DATE AT TIME ZONE 'Asia/Manila') - INTERVAL '6 days'
               AND created_at < (CURRENT_DATE AT TIME ZONE 'Asia/Manila') + INTERVAL '1 day'
             GROUP BY DATE(created_at AT TIME ZONE 'Asia/Manila'))
            UNION ALL
            (SELECT DATE(created_at AT TIME ZONE 'Asia/Manila') AS date, COUNT(*) AS count
             FROM bhws
             WHERE created_at >= (CURRENT_DATE AT TIME ZONE 'Asia/Manila') - INTERVAL '6 days'
               AND created_at < (CURRENT_DATE AT TIME ZONE 'Asia/Manila') + INTERVAL '1 day'
             GROUP BY DATE(created_at AT TIME ZONE 'Asia/Manila'))
          ) as combined_daily
          GROUP BY date
          ORDER BY date ASC
        `),
        client.query(`SELECT COUNT(*) as staff_count FROM users`)
      ]);

      const dailyLabels = [];
      const dailyData = [];
      const staffCount = parseInt(staffCountRes.rows[0].staff_count);
      
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
        
        // Add doctors/bhws count plus a portion of staff (since we don't have their registration dates)
        const baseCount = record ? parseInt(record.count) : 0;
        // Add staff count only to today to show total users without inflating historical data
        const totalCount = (i === 0) ? baseCount + staffCount : baseCount;
        
        dailyLabels.push(dateStr);
        dailyData.push(totalCount);
      }

      const dailyReportData = {
        labels: dailyLabels,
        datasets: [
          {
            label: 'User Registrations',
            data: dailyData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
        ],
      };

      // Monthly Reports for the current year
      // Include staff users in current month
      const currentYear = new Date().getFullYear();
      const monthlyRes = await client.query(`
        SELECT month, SUM(count) as count FROM (
          (SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM') AS month, COUNT(*) AS count
           FROM doctors
           WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') = $1
           GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM'))
          UNION ALL
          (SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM') AS month, COUNT(*) AS count
           FROM bhws
           WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') = $1
           GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Manila', 'YYYY-MM'))
        ) as combined_monthly
        GROUP BY month
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
      const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
      
      for (let month = 1; month <= 12; month++) {
        monthlyLabels.push(monthNames[month - 1]);
        let count = monthCountMap[month] || 0;
        // Add staff count to current month only
        if (month === currentMonth) {
          count += staffCount;
        }
        monthlyData.push(count);
      }

      const monthlyReportData = {
        labels: monthlyLabels,
        datasets: [
          {
            label: 'User Registrations',
            data: monthlyData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
        ],
      };

      // Yearly Reports (all years from 2020 to current year)
      const startYear = 2020;
      const currentYearValue = new Date().getFullYear();
      
      // Get counts for all years from 2020 to current year
      // Note: users table doesn't have created_at, so we exclude it from yearly analytics
      const yearlyRes = await client.query(`
        SELECT year, SUM(count) as count FROM (
          (SELECT EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') AS year, COUNT(*) AS count
           FROM doctors
           WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') BETWEEN $1 AND $2
           GROUP BY EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila'))
          UNION ALL
          (SELECT EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') AS year, COUNT(*) AS count
           FROM bhws
           WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila') BETWEEN $1 AND $2
           GROUP BY EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Manila'))
        ) as combined_yearly
        GROUP BY year
        ORDER BY year ASC
      `, [startYear, currentYearValue]);

      // Create arrays for all years from 2020 to current year
      const yearlyLabels = [];
      const yearlyData = [];
      
      for (let year = startYear; year <= currentYearValue; year++) {
        const yearStr = year.toString();
        const record = yearlyRes.rows.find(row => row.year.toString() === yearStr);
        let count = record ? parseInt(record.count) : 0;
        
        // Add staff count to current year only
        if (year === currentYearValue) {
          count += staffCount;
        }
        
        yearlyLabels.push(yearStr);
        yearlyData.push(count);
      }

      const yearlyReportData = {
        labels: yearlyLabels,
        datasets: [
          {
            label: 'User Registrations',
            data: yearlyData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
        ],
      };

      res.status(200).json({
        userSummary: { users, total: totalUsers },
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
