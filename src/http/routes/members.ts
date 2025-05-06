import { Router } from 'express';
import client from '../../bot/discordBot';

const router = Router();

router.post('/', (req, res) => {
  const { userId, guildId } = req.body;

  client.emit('guildMemberAdd', {
    user: { username: userId },
    guild: { id: guildId },
  } as any);

  console.log('[HTTP] Nuevo miembro recibido:', req.body);
  res.sendStatus(200);
});

export default router;
