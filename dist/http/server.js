"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const members_1 = __importDefault(require("./routes/members"));
const messages_1 = __importDefault(require("./routes/messages"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/members', members_1.default);
app.use('/api/messages', messages_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[HTTP] Escuchando en puerto ${PORT}`));
