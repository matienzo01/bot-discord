import { Router } from 'express';
import { TextChannel } from 'discord.js';
import client from '../../bot/discordBot';
import { CHANNEL_ID } from '../../constanst';

const router = Router();

router.post('/', async (req, res) => {
  const { content } = req.body;
  console.log('content', content);


  if (!content) {
    res.status(400).json({ error: 'Falta el campo "content"' });
  }

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel?.isTextBased()) {
      res.status(500).json({ error: 'El canal no es de texto' });
    }

    await (channel as TextChannel).send(content);
    res.status(200).json({ message: 'Mensaje enviado a Discord' });
  } catch (err) {
    console.error('[Discord] Error al enviar mensaje:', err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});


export default router;

