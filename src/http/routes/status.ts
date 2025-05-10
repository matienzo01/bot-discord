import { Router } from 'express';
import client from '../../bot/discordBot';

const router = Router();

router.get('/', (req, res) => {
  res.sendStatus(200).send('OK');
});

export default router;
