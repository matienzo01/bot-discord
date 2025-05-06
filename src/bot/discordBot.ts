import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { CHANNEL_ID } from '../constanst';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

const sendMessage = async (channelId: string, message: string) => {
  const channel: TextChannel = await client.channels.fetch(channelId) as TextChannel;
  console.log(`[Discord] Enviando mensaje al canal ${channel.name}`);

  channel.send(message);
};

client.once('ready', () => {
  console.log(`[Discord] Bot conectado como ${client.user?.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  console.log(`[Discord] Nuevo miembro: ${member.user.username}`);
  await sendMessage(CHANNEL_ID, `Hola ${member.user.username}!`);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
