import pool from '@/lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id, type, search } = req.query;
        let query = 'SELECT * FROM patients';
        let params = [];
        let where = [];

        if (type) {
          where.push(`type = $${params.length + 1}`);
          params.push(type);
        }

        if (search) {
          const words = search.split(/\s+/).filter((w) => w);
          if (words.length) {
            const searchConditions = words
              .map((word) => {
                const p = params.length + 1;
                params.push(`%${word}%`);
                return `(last_name ILIKE $${p} OR first_name ILIKE $${p} OR middle_name ILIKE $${p} OR suffix ILIKE $${p})`;
              })
              .join(' AND ');
            where.push(`(${searchConditions})`);
          }
        }

        if (where.length) {
          query += ' WHERE ' + where.join(' AND ');
        }

        if (id) {
          if (where.length) {
            query += ' AND ';
          } else {
            query += ' WHERE ';
          }
          query += `id = $${params.length + 1}`;
          params.push(id);
        }

        const { rows } = await pool.query(query, params);
        if (id) {
          return res.status(200).json(rows[0] || null);
        }
        return res.status(200).json(rows);
      }

      case 'POST': {
        const data = req.body;
        const { last_name, first_name, middle_name, suffix, birth_date, type } = data;

        // Check for existing patient with the same details in staff_data
        const checkQuery = `
          SELECT id FROM patients 
          WHERE last_name ILIKE $1 
          AND first_name ILIKE $2 
          AND COALESCE(middle_name, '') ILIKE COALESCE($3, '')
          AND COALESCE(suffix, '') ILIKE COALESCE($4, '')
          AND birth_date = $5
          AND type = 'staff_data'
        `;
        const checkParams = [last_name, first_name, middle_name || '', suffix || '', birth_date];
        const { rows: existing } = await pool.query(checkQuery, checkParams);

        if (existing.length > 0) {
          return res.status(409).json({ error: 'Patient already exists in staff records' });
        }

        const keys = Object.keys(data).filter(
          (k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at'
        );
        const values = keys.map((k) => data[k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
        const insertQuery = `INSERT INTO patients (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
        const { rows } = await pool.query(insertQuery, values);
        return res.status(201).json(rows[0]);
      }

      case 'PUT': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'ID is required for update' });
        }
        const data = req.body;
        const keys = Object.keys(data).filter(
          (k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at'
        );
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
        const values = keys.map((k) => data[k]);
        values.push(id);
        const updateQuery = `UPDATE patients SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
        const { rows } = await pool.query(updateQuery, values);
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        return res.status(200).json(rows[0]);
      }

      case 'DELETE': {
        const { id, type } = req.query;
        if (!id || !type) {
          return res.status(400).json({ error: 'ID and type are required for delete' });
        }
        const deleteQuery = 'DELETE FROM patients WHERE id = $1 AND type = $2';
        await pool.query(deleteQuery, [id, type]);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}