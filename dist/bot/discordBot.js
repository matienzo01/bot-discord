"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const constanst_1 = require("../constanst");
const rcon_1 = require("../rcon");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.MessageContent
    ]
});
const sendMessage = async (channelId, message) => {
    const channel = await client.channels.fetch(channelId);
    console.log(`[Discord] Enviando mensaje al canal ${channel.name}`);
    channel.send(message);
};
client.once('ready', () => {
    console.log(`[Discord] Bot conectado como ${client.user?.tag}`);
});
client.on('guildMemberAdd', async (member) => {
    console.log(`[Discord] Nuevo miembro: ${member.user.username}`);
    await sendMessage(constanst_1.CHANNEL_ID, `Hola ${member.user.username}!`);
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'whitelist') {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'add') {
            const usuario = interaction.options.getString('usuario', true);
            try {
                const rconResponse = await (0, rcon_1.addToWhitelist)(usuario);
                await interaction.reply(`✅ ${usuario} agregado: ${rconResponse}`);
            }
            catch (error) {
                console.error(error);
                await interaction.reply('❌ Error al comunicarse con el servidor de Minecraft.');
            }
        }
    }
});
client.login(process.env.DISCORD_TOKEN);
exports.default = client;
