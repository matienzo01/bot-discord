import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  console.log('[HTTP] Nuevo miembro recibido:', req.body);
  res.sendStatus(200);
});

export default router;
