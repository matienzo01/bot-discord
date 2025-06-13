import { Client, Events, GatewayIntentBits, Interaction, TextChannel } from 'discord.js';
import { CHANNEL_ID } from '../constanst';
import dotenv from 'dotenv';

dotenv.config();

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

client.on(Events.GuildMemberAdd, async (member) => {
  console.log(`[Discord] Nuevo miembro: ${member.user.username}`);
  await sendMessage(CHANNEL_ID, `Hola ${member.user.username}!`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'whitelist') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const usuario = interaction.options.getString('usuario', true);

      try {
        const rconResponse = 'test' //await addToWhitelist(usuario);
        await interaction.reply(`✅ ${usuario} agregado: ${rconResponse}`);
      } catch (error) {
        console.error(error);
        await interaction.reply('❌ Error al comunicarse con el servidor de Minecraft.');
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

export default client;
