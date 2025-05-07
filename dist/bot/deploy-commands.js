"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/deploy-commands.ts
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const commands = [
    new discord_js_1.SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Comandos relacionados a la whitelist')
        .addSubcommand(sub => sub
        .setName('add')
        .setDescription('Agrega alguien a la whitelist')
        .addStringOption(option => option
        .setName('usuario')
        .setDescription('Nombre del usuario a agregar')
        .setRequired(true)))
        .toJSON()
];
const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log('Registrando comandos slash...');
        await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), // o usar applicationGuildCommands para testing
        { body: commands });
        console.log('Comandos registrados con éxito.');
    }
    catch (error) {
        console.error(error);
    }
})();
