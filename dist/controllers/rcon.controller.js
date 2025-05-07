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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RconController = void 0;
const routing_controllers_1 = require("routing-controllers");
const inversify_1 = require("inversify");
const types_1 = require("../config/types");
const rcon_service_1 = require("../services/rcon.service");
let RconController = class RconController {
    constructor(rconService) {
        this.rconService = rconService;
    }
    async executeCommand(body) {
        try {
            console.log('Comando a ejecutar controlador:', body.command);
            const response = await this.rconService.executeCommand(body.command);
            return { success: true, response };
        }
        catch (error) {
            console.error('Error en controlador RCON:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al ejecutar comando'
            };
        }
    }
};
exports.RconController = RconController;
__decorate([
    (0, routing_controllers_1.Post)('/command'),
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RconController.prototype, "executeCommand", null);
exports.RconController = RconController = __decorate([
    (0, routing_controllers_1.JsonController)('/rcon'),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.RconService)),
    __metadata("design:paramtypes", [rcon_service_1.RconService])
], RconController);
