import { Client, Events, GatewayIntentBits, Interaction, TextChannel } from 'discord.js';
import { CHANNEL_ID } from '../constanst';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
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

  // Buscar el rol "normal" en el servidor
  let role = member.guild.roles.cache.find(r => r.name === 'normal');

  // Si no existe, crearlo
  if (!role) {
    try {
      role = await member.guild.roles.create({
        name: 'normal',
        color: 'Default', // Puedes cambiar el color si quieres
        reason: 'Rol por defecto para nuevos miembros',
      });
      console.log('[Discord] Rol "normal" creado.');
    } catch (error) {
      console.error('[Discord] Error al crear el rol "normal":', error);
      return;
    }
  }

  // Asignar el rol al nuevo miembro
  try {
    await member.roles.add(role);
    console.log(`[Discord] Rol "normal" asignado a ${member.user.username}`);
  } catch (error) {
    console.error(`[Discord] Error al asignar el rol a ${member.user.username}:`, error);
  }
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
