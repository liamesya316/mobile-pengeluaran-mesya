// server.js
import { pool } from './db.js';
import express from 'express';
import cors from 'cors';

const app = express();

async function resolveCategoryId(category, categoryId) {
  if (categoryId !== undefined) return categoryId || null;
  if (!category || category === 'Tanpa Kategori') return null;

  const [rows] = await pool.query(
    'SELECT id FROM kategori WHERE nama = ? LIMIT 1',
    [category]
  );
  if (rows.length === 0) {
    const error = new Error(`Kategori "${category}" tidak ditemukan`);
    error.code = 'CATEGORY_NOT_FOUND';
    throw error;
  }
  return rows[0].id;
}

app.use(cors());          // izinkan akses lintas asal (CORS)
app.use(express.json());    // baca body berformat JSON

app.get('/', (req, res) => {
  res.send('API Pengeluaran berjalan');
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', database: 'ok' });
  } catch (error) {
    console.error('Pemeriksaan database gagal:', error.message);
    res.status(503).json({ api: 'ok', database: 'gagal' });
  }
});

app.get('/kategori', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nama FROM kategori ORDER BY nama');
    res.json(rows);
  } catch (error) {
    console.error('Gagal mengambil kategori:', error.message);
    res.status(500).json({ pesan: 'Gagal mengambil kategori' });
  }
});

// 1. AMBIL SELURUH DATA (GET /pengeluaran)
app.get('/pengeluaran', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.judul, p.nominal, p.tanggal,
              k.nama AS kategori
       FROM pengeluaran p
       LEFT JOIN kategori k ON p.id_kategori = k.id
       ORDER BY p.tanggal DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

// 2. AMBIL SATU DATA BERDASARKAN ID (GET /pengeluaran/:id)
app.get('/pengeluaran/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pengeluaran WHERE id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

// 3. TAMBAH DATA BARU (POST /pengeluaran)
app.post('/pengeluaran', async (req, res) => {
  const { judul, nominal, id_kategori, kategori } = req.body;
  if (!judul || !nominal) {
    return res.status(400).json({ pesan: 'judul & nominal wajib diisi' });
  }
  try {
    const categoryId = await resolveCategoryId(kategori, id_kategori);
    const [hasil] = await pool.query(
      `INSERT INTO pengeluaran (judul, nominal, id_kategori)
       VALUES (?, ?, ?)`,
      [judul, Number(nominal), categoryId]
    );
    res.status(201).json({ id: hasil.insertId, judul, nominal });
  } catch (e) {
    const status = e.code === 'CATEGORY_NOT_FOUND' ? 400 : 500;
    res.status(status).json({ pesan: e.message || 'Gagal menyimpan data' });
  }
});

app.put('/pengeluaran/:id', async (req, res) => {
  try {
    const { judul, nominal, id_kategori, kategori } = req.body;
    if (!judul || !nominal) {
      return res.status(400).json({ pesan: 'judul & nominal wajib diisi' });
    }
    const categoryId = await resolveCategoryId(kategori, id_kategori);
    const [hasil] = await pool.query(
      'UPDATE pengeluaran SET judul = ?, nominal = ?, id_kategori = ? WHERE id = ?',
      [judul, Number(nominal), categoryId, req.params.id]
    );
    if (hasil.affectedRows === 0) {
      return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    }
    res.json({ id: Number(req.params.id), judul, nominal });
  } catch (e) {
    console.error(e);
    const status = e.code === 'CATEGORY_NOT_FOUND' ? 400 : 500;
    return res.status(status).json({ pesan: e.message || 'Operasi database gagal' });
  }
});
 
app.delete('/pengeluaran/:id', async (req, res) => {
  try {
    const [hasil] = await pool.query(
      'DELETE FROM pengeluaran WHERE id = ?', [req.params.id]
    );
    if (hasil.affectedRows === 0) {
      return res.status(404).json({ pesan: 'Data tidak ditemukan' });
    }
    res.status(204).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ pesan: 'Operasi database gagal' });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT} dan siap diakses jaringan lokal`);
});