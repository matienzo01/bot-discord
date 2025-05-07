"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToWhitelist = addToWhitelist;
const inversify_config_1 = require("./config/inversify.config");
const types_1 = require("./config/types");
async function addToWhitelist(username) {
    const rconService = inversify_config_1.container.get(types_1.TYPES.RconService);
    try {
        return await rconService.executeCommand(`whitelist add ${username}`);
    }
    catch (error) {
        console.error('Error al agregar usuario a la whitelist:', error);
        throw error;
    }
}
