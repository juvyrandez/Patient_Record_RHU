import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const client = await pool.connect();
    try {
      // Fetch metrics
      const [staffPatientsRes, bhwPatientsRes, doctorsRes, bhwsRes, rhuStaffRes] = await Promise.all([
        client.query("SELECT COUNT(*) AS count FROM patients WHERE type = 'staff_data'"),
        client.query("SELECT COUNT(*) AS count FROM patients WHERE type = 'bhw_data'"),
        client.query('SELECT COUNT(*) AS count FROM doctors'),
        client.query('SELECT COUNT(*) AS count FROM bhws'),
        client.query("SELECT COUNT(*) AS count FROM users WHERE usertype = 'staff'"),
      ]);

      const metrics = {
        staffPatients: parseInt(staffPatientsRes.rows[0].count),
        bhwPatients: parseInt(bhwPatientsRes.rows[0].count),
        doctors: parseInt(doctorsRes.rows[0].count),
        bhwWorkers: parseInt(bhwsRes.rows[0].count),
        rhuStaff: parseInt(rhuStaffRes.rows[0].count),
      };

      // Fetch recent activities (notifications and login history)
      const notificationsRes = await client.query(`
        SELECT id, message, created_at
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const loginsRes = await client.query(`
        SELECT id, user_id, user_type, login_time AS created_at,
               COALESCE(
                 CASE 
                   WHEN user_type = 'doctor' THEN (SELECT fullname FROM doctors WHERE id = user_id)
                   WHEN user_type = 'bhw' THEN (SELECT fullname FROM bhws WHERE id = user_id)
                   WHEN user_type IN ('admin', 'staff') THEN (SELECT fullname FROM users WHERE id = user_id)
                 END,
                 user_type
               ) AS user_name,
               'User logged in' AS message
        FROM login_history
        WHERE user_type IN ('admin', 'staff', 'doctor', 'bhw')
        ORDER BY login_time DESC
        LIMIT 5
      `);

      const activities = [
        ...notificationsRes.rows.map(row => ({
          id: `notification-${row.id}`,
          source: 'notification',
          action: row.message,
          date: new Date(row.created_at).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }),
          time: new Date(row.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }),
        })),
        ...loginsRes.rows.map(row => ({
          id: `login-${row.id}`,
          source: 'login',
          action: `${row.user_name} logged in`,
          date: new Date(row.created_at).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }),
          time: new Date(row.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }),
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Fetch users distribution
      const usersDistribution = {
        labels: ['Doctors', 'BHW Workers', 'RHU Staff'],
        datasets: [
          {
            label: 'User Count',
            data: [
              parseInt(doctorsRes.rows[0].count),
              parseInt(bhwsRes.rows[0].count),
              parseInt(rhuStaffRes.rows[0].count),
            ],
            backgroundColor: ['#10B981', '#6366F1', '#F59E0B'],
          },
        ],
      };

      res.status(200).json({
        metrics,
        activities,
        usersDistribution,
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