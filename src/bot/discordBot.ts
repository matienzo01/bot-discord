import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`[Discord] Bot conectado como ${client.user?.tag}`);
});

client.on('guildMemberAdd', (member) => {
  console.log(`[Discord] Nuevo miembro: ${member.user.username}`);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
