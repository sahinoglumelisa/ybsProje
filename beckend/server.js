import pkg from 'pg';
const { Pool } = pkg; // Pool'u CommonJS'den çekiyoruz

const pool = new Pool({
  user: 'postgres', // PostgreSQL kullanıcı adınız
  host: 'localhost',
  database: 'stok', // Veritabanı adınız
  password: '123', // PostgreSQL şifreniz
  port: 5432,
});

// Express.js sunucusu
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ürünleri listele
app.get('/urunler', async (req, res) => {
  const { depo_id } = req.query; // depo_id parametresini alıyoruz
  try {
    // Eğer depo_id varsa, o depodaki ürünleri getir
    if (depo_id && depo_id !== 'hepsi') {
      // Depodaki Urunler tablosunu ve Urunler tablosunu join'leyerek ürünleri alıyoruz
      const result = await pool.query(`
        SELECT u.urun_adi, u.fiyat, u.agirlik, du.miktar, du.depo_id
        FROM Depodaki_Urunler du
        JOIN Urunler u ON du.urun_adi = u.urun_adi
        WHERE du.depo_id = $1
      `, [depo_id]);
      res.json(result.rows);
    } else {
      // "Hepsi" seçeneği veya depo_id yoksa, tüm ürünleri getir
      const result = await pool.query(`
        SELECT u.urun_adi, u.fiyat, u.agirlik, du.miktar, du.depo_id
        FROM Depodaki_Urunler du
        JOIN Urunler u ON du.urun_adi = u.urun_adi
      `);
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/depolar', async (req, res) => {
  const { kapasite } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Depolar (kapasite) VALUES ($1) RETURNING *',
      [kapasite]
    );
    res.json(result.rows[0]); // Yeni eklenen depo verisini döndürüyoruz
  } catch (err) {
    console.error('Hata: ', err);  // Hata mesajını daha detaylı görme
    res.status(500).json({ error: err.message });
  }
});
// Depoları listele
app.get('/depolar', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Depolar ORDER BY kapasite ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server başlat
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
