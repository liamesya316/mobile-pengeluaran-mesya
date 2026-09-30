import express from 'express';
import cors from 'cors';
import pengeluaranRoutes from './routes/pengeluaran.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Pengeluaran berjalan');
});

app.use('/pengeluaran', pengeluaranRoutes);

export default app;