import express from 'express';
import membersRoutes from './routes/members';
import messagesRoutes from './routes/messages';
import statusRoutes from './routes/status';

const app = express();
app.use(express.json());
app.use('/api/members', membersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/status', statusRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[HTTP] Escuchando en puerto ${PORT}`));
