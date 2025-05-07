"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const types_1 = require("./types");
const rcon_service_1 = require("../services/rcon.service");
const discord_service_1 = require("../services/discord.service");
const container = new inversify_1.Container();
exports.container = container;
// Registrar servicios
container.bind(types_1.TYPES.RconService).to(rcon_service_1.RconService).inSingletonScope();
container.bind(types_1.TYPES.DiscordService).to(discord_service_1.DiscordService).inSingletonScope();
