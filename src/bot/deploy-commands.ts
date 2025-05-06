// src/deploy-commands.ts
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Comandos relacionados a la whitelist')
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Agrega alguien a la whitelist')
        .addStringOption(option =>
          option
            .setName('usuario')
            .setDescription('Nombre del usuario a agregar')
            .setRequired(true)
        )
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!), // o usar applicationGuildCommands para testing
      { body: commands }
    );
    console.log('Comandos registrados con éxito.');
  } catch (error) {
    console.error(error);
  }
})();
