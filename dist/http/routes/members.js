"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discordBot_1 = __importDefault(require("../../bot/discordBot"));
const router = (0, express_1.Router)();
router.post('/', (req, res) => {
    const { userId, guildId } = req.body;
    discordBot_1.default.emit('guildMemberAdd', {
        user: { username: userId },
        guild: { id: guildId },
    });
    console.log('[HTTP] Nuevo miembro recibido:', req.body);
    res.sendStatus(200);
});
exports.default = router;
