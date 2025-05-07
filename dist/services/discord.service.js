"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordService = void 0;
const inversify_1 = require("inversify");
const discord_js_1 = require("discord.js");
let DiscordService = class DiscordService {
    constructor() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
    }
    async connect() {
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
            console.log('Bot de Discord conectado');
        }
        catch (error) {
            console.error('Error al conectar el bot de Discord:', error);
            throw error;
        }
    }
    getClient() {
        return this.client;
    }
};
exports.DiscordService = DiscordService;
exports.DiscordService = DiscordService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], DiscordService);
