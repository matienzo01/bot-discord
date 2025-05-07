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
exports.RconService = void 0;
const inversify_1 = require("inversify");
const rcon_client_1 = require("rcon-client");
let RconService = class RconService {
    constructor() {
        const config = {
            host: process.env.RCON_HOST || 'localhost',
            port: parseInt(process.env.RCON_PORT || '25575'),
            password: process.env.RCON_PASSWORD || '',
        };
        this.rcon = new rcon_client_1.Rcon({
            host: config.host,
            port: config.port,
            password: config.password,
        });
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.rcon.on('connect', () => {
            console.log('Conectado al servidor RCON');
        });
        this.rcon.on('error', (error) => {
            console.error('Error en RCON:', error);
        });
    }
    async initialize() {
        try {
            await this.rcon.connect();
        }
        catch (error) {
            console.error('Error al conectar con RCON:', error);
            throw error;
        }
    }
    async executeCommand(command) {
        try {
            console.log('Comando a ejecutar:', command);
            const response = await this.rcon.send(command);
            return response || 'Comando ejecutado sin respuesta';
        }
        catch (error) {
            console.error('Error al ejecutar comando RCON:', error);
            throw error;
        }
    }
    async shutdown() {
        try {
            await this.rcon.end();
        }
        catch (error) {
            console.error('Error al cerrar RCON:', error);
        }
    }
};
exports.RconService = RconService;
exports.RconService = RconService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], RconService);
