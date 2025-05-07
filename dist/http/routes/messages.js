"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discordBot_1 = __importDefault(require("../../bot/discordBot"));
const constanst_1 = require("../../constanst");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { content } = req.body;
    console.log('content', content);
    if (!content) {
        res.status(400).json({ error: 'Falta el campo "content"' });
    }
    try {
        const channel = await discordBot_1.default.channels.fetch(constanst_1.CHANNEL_ID);
        if (!channel?.isTextBased()) {
            res.status(500).json({ error: 'El canal no es de texto' });
        }
        await channel.send(content);
        res.status(200).json({ message: 'Mensaje enviado a Discord' });
    }
    catch (err) {
        console.error('[Discord] Error al enviar mensaje:', err);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});
exports.default = router;
